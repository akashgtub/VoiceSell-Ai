import os
import json
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.models import Call, Message
from app.schemas import (
    CallCreate, CallResponse, CallDetailResponse, CallUpdateStatus, 
    CallEndRequest, MessageCreate, MessageResponse, LiveSpeechInput, LiveSpeechOutput
)
from app.config import settings
from app.services.product_service import get_or_create_product_config, get_or_create_system_settings
from app.services.sales_agent import get_sales_agent_reply
from app.services.summary_agent import analyze_transcript_llm, analyze_transcript_rule_based
from app.services.tts_service import synthesize_speech

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.post("", response_model=CallDetailResponse)
async def start_call(call_in: CallCreate, db: Session = Depends(get_db)):
    """
    Initializes a new live sales call session.
    Generates initial greeting from AI Sales Agent and persists in DB.
    """
    call = Call(
        recording_consent=call_in.recording_consent,
        status="In Progress"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # Fetch product & settings
    product = get_or_create_product_config(db)
    sys_settings = get_or_create_system_settings(db)

    # Initial AI greeting message
    initial_greeting = f"Hello! Thanks for connecting with {product.product_name}. I'm your AI sales representative. How are you doing today, and what brings you to explore our platform?"
    
    greeting_msg = Message(
        call_id=call.id,
        speaker="ai",
        content=initial_greeting
    )
    db.add(greeting_msg)
    db.commit()
    db.refresh(call)

    return call

@router.get("", response_model=dict)
def list_calls(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_duration: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Searchable, filterable, and paginated list of calls.
    """
    query = db.query(Call)

    if status and status != "All":
        query = query.filter(Call.status == status)

    if min_duration is not None and min_duration > 0:
        query = query.filter(Call.duration_seconds >= min_duration)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Call.id.ilike(search_fmt),
                Call.summary.ilike(search_fmt),
                Call.customer_requirements.ilike(search_fmt),
                Call.notes.ilike(search_fmt)
            )
        )

    total_count = query.count()
    calls = query.order_by(desc(Call.started_at)).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for c in calls:
        items.append(CallResponse(
            id=c.id,
            started_at=c.started_at,
            ended_at=c.ended_at,
            duration_seconds=c.duration_seconds,
            status=c.status,
            original_ai_status=c.original_ai_status,
            recording_path=c.recording_path,
            recording_url=f"/api/calls/{c.id}/recording" if c.recording_path else None,
            recording_consent=c.recording_consent,
            summary=c.summary,
            customer_requirements=c.customer_requirements,
            objections=c.objections,
            next_steps=c.next_steps,
            key_features_discussed=c.key_features_discussed,
            buying_signals=c.buying_signals,
            notes=c.notes,
            created_at=c.created_at,
            message_count=len(c.messages)
        ))

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1
    }

@router.get("/{call_id}", response_model=CallDetailResponse)
def get_call(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    messages_resp = [
        MessageResponse(
            id=m.id,
            call_id=m.call_id,
            speaker=m.speaker,
            content=m.content,
            timestamp=m.timestamp
        ) for m in call.messages
    ]

    return CallDetailResponse(
        id=call.id,
        started_at=call.started_at,
        ended_at=call.ended_at,
        duration_seconds=call.duration_seconds,
        status=call.status,
        original_ai_status=call.original_ai_status,
        recording_path=call.recording_path,
        recording_url=f"/api/calls/{call.id}/recording" if call.recording_path else None,
        recording_consent=call.recording_consent,
        summary=call.summary,
        customer_requirements=call.customer_requirements,
        objections=call.objections,
        next_steps=call.next_steps,
        key_features_discussed=call.key_features_discussed,
        buying_signals=call.buying_signals,
        notes=call.notes,
        created_at=call.created_at,
        message_count=len(call.messages),
        messages=messages_resp
    )

@router.post("/{call_id}/messages", response_model=LiveSpeechOutput)
async def send_customer_message(
    call_id: str,
    msg_in: MessageCreate,
    db: Session = Depends(get_db)
):
    """
    Accepts speech recognition text from customer, persists in DB,
    passes context to AI Sales Agent, persists AI reply, and returns reply with TTS audio.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Save customer message
    cust_msg = Message(
        call_id=call.id,
        speaker="customer",
        content=msg_in.content.strip()
    )
    db.add(cust_msg)
    db.commit()

    # Reconstruct conversation history
    all_msgs = db.query(Message).filter(Message.call_id == call.id).order_by(Message.timestamp).all()
    history = [
        {"role": "user" if m.speaker == "customer" else "assistant", "content": m.content}
        for m in all_msgs
    ]

    # Fetch product config & system settings
    product = get_or_create_product_config(db)
    sys_settings = get_or_create_system_settings(db)

    # Generate sales agent response
    ai_reply_text = await get_sales_agent_reply(history, product, sys_settings)

    # Save AI message
    ai_msg = Message(
        call_id=call.id,
        speaker="ai",
        content=ai_reply_text
    )
    db.add(ai_msg)
    db.commit()

    # Synthesize speech
    audio_base64 = None
    if sys_settings.tts_provider in ["edge-tts", "openai"]:
        audio_base64 = await synthesize_speech(
            text=ai_reply_text,
            provider=sys_settings.tts_provider,
            voice=sys_settings.tts_voice,
            api_key=sys_settings.openai_api_key
        )

    return LiveSpeechOutput(
        reply_text=ai_reply_text,
        audio_base64=audio_base64
    )

@router.post("/{call_id}/end", response_model=CallDetailResponse)
async def end_call(
    call_id: str,
    end_req: CallEndRequest,
    db: Session = Depends(get_db)
):
    """
    Ends call, records duration, triggers transcript analysis and sales status classification.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    call.ended_at = datetime.utcnow()
    if end_req.duration_seconds is not None:
        call.duration_seconds = end_req.duration_seconds
    else:
        diff = (call.ended_at - call.started_at).total_seconds()
        call.duration_seconds = max(0, int(diff))

    # Compile transcript
    messages = db.query(Message).filter(Message.call_id == call.id).order_by(Message.timestamp).all()
    transcript_lines = []
    for m in messages:
        speaker_label = "Sales Agent" if m.speaker == "ai" else "Customer"
        transcript_lines.append(f"{speaker_label}: {m.content}")
    transcript_text = "\n".join(transcript_lines)

    # Product and system settings
    product = get_or_create_product_config(db)
    sys_settings = get_or_create_system_settings(db)

    # Analyze transcript
    analysis = await analyze_transcript_llm(transcript_text, product, sys_settings)

    call.summary = analysis.get("summary", "Call completed.")
    call.customer_requirements = json.dumps(analysis.get("customer_requirements", []))
    call.objections = json.dumps(analysis.get("objections", []))
    call.next_steps = json.dumps(analysis.get("agreed_next_steps", []))
    call.key_features_discussed = json.dumps(analysis.get("key_features_discussed", []))
    call.buying_signals = json.dumps(analysis.get("buying_signals", []))
    
    assigned_status = analysis.get("status", "Interested")
    call.status = assigned_status
    call.original_ai_status = assigned_status

    db.commit()
    db.refresh(call)

    messages_resp = [
        MessageResponse(
            id=m.id,
            call_id=m.call_id,
            speaker=m.speaker,
            content=m.content,
            timestamp=m.timestamp
        ) for m in call.messages
    ]

    return CallDetailResponse(
        id=call.id,
        started_at=call.started_at,
        ended_at=call.ended_at,
        duration_seconds=call.duration_seconds,
        status=call.status,
        original_ai_status=call.original_ai_status,
        recording_path=call.recording_path,
        recording_url=f"/api/calls/{call.id}/recording" if call.recording_path else None,
        recording_consent=call.recording_consent,
        summary=call.summary,
        customer_requirements=call.customer_requirements,
        objections=call.objections,
        next_steps=call.next_steps,
        key_features_discussed=call.key_features_discussed,
        buying_signals=call.buying_signals,
        notes=call.notes,
        created_at=call.created_at,
        message_count=len(call.messages),
        messages=messages_resp
    )

@router.post("/{call_id}/recording")
async def upload_call_recording(
    call_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Saves actual dual-channel audio recording file (.webm or .wav) in persistent storage.
    Enforces consent validation.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if not call.recording_consent:
        raise HTTPException(status_code=400, detail="Recording consent was not obtained for this call.")

    # Determine extension
    ext = ".webm"
    if file.filename and "." in file.filename:
        ext = "." + file.filename.split(".")[-1].lower()
    
    dest_filename = f"{call_id}{ext}"
    dest_path = Path(settings.RECORDINGS_PATH) / dest_filename

    # Read and save bytes
    contents = await file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)

    call.recording_path = dest_filename
    call.recording_url = f"/api/calls/{call.id}/recording"
    db.commit()

    return {
        "success": True,
        "message": "Call recording persisted successfully",
        "recording_url": call.recording_url,
        "file_size": len(contents)
    }

@router.get("/{call_id}/recording")
def stream_call_recording(call_id: str, db: Session = Depends(get_db)):
    """
    Streams the persistent audio recording for playback.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call or not call.recording_path:
        raise HTTPException(status_code=404, detail="Recording not found")

    file_path = Path(settings.RECORDINGS_PATH) / call.recording_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Recording file missing from storage")

    media_type = "audio/webm"
    if file_path.suffix == ".wav":
        media_type = "audio/wav"
    elif file_path.suffix == ".mp3":
        media_type = "audio/mpeg"

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=f"recording_{call_id}{file_path.suffix}"
    )

@router.get("/{call_id}/transcript")
def get_call_transcript(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    messages = db.query(Message).filter(Message.call_id == call.id).order_by(Message.timestamp).all()
    transcript_text = "\n".join([f"{'Sales Agent' if m.speaker == 'ai' else 'Customer'}: {m.content}" for m in messages])
    
    return {
        "call_id": call.id,
        "transcript_text": transcript_text,
        "messages": [
            {
                "id": m.id,
                "speaker": m.speaker,
                "content": m.content,
                "timestamp": m.timestamp.isoformat()
            } for m in messages
        ]
    }

@router.get("/{call_id}/summary")
def get_call_summary(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    return {
        "call_id": call.id,
        "summary": call.summary,
        "status": call.status,
        "customer_requirements": json.loads(call.customer_requirements) if call.customer_requirements else [],
        "objections": json.loads(call.objections) if call.objections else [],
        "next_steps": json.loads(call.next_steps) if call.next_steps else [],
        "key_features_discussed": json.loads(call.key_features_discussed) if call.key_features_discussed else [],
        "buying_signals": json.loads(call.buying_signals) if call.buying_signals else []
    }

@router.patch("/{call_id}/status")
def update_call_status(
    call_id: str,
    status_update: CallUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Allows authorized user to manually correct status while preserving original_ai_status for auditing.
    """
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    valid_statuses = ["Converted", "Interested", "Follow-up Required", "Not Interested", "Demo Requested", "No Response"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    if not call.original_ai_status:
        call.original_ai_status = call.status

    call.status = status_update.status
    if status_update.notes:
        call.notes = status_update.notes

    db.commit()
    db.refresh(call)

    return {
        "success": True,
        "status": call.status,
        "original_ai_status": call.original_ai_status,
        "notes": call.notes
    }
