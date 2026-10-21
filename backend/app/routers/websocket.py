import json
import logging
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Call, Message
from app.services.product_service import get_or_create_product_config, get_or_create_system_settings
from app.services.sales_agent import get_sales_agent_reply
from app.services.tts_service import synthesize_speech

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/call/{call_id}")
async def call_websocket_endpoint(websocket: WebSocket, call_id: str):
    await websocket.accept()
    
    db: Session = SessionLocal()
    try:
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            await websocket.send_json({"type": "error", "message": "Call not found"})
            await websocket.close()
            return

        # Send initial confirmation
        await websocket.send_json({
            "type": "session_ready",
            "call_id": call_id,
            "status": call.status,
            "recording_consent": call.recording_consent
        })

        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except Exception:
                continue

            event_type = data.get("type")

            if event_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif event_type == "customer_speaking":
                # Acknowledge speaking status
                await websocket.send_json({
                    "type": "state_update",
                    "customer_speaking": data.get("is_speaking", False)
                })

            elif event_type == "customer_speech":
                speech_text = data.get("text", "").strip()
                if not speech_text:
                    continue

                # Store customer message
                cust_msg = Message(
                    call_id=call_id,
                    speaker="customer",
                    content=speech_text
                )
                db.add(cust_msg)
                db.commit()

                # Notify frontend of customer message stored
                await websocket.send_json({
                    "type": "message_logged",
                    "speaker": "customer",
                    "content": speech_text,
                    "timestamp": datetime.utcnow().isoformat()
                })

                # Notify UI that AI is thinking
                await websocket.send_json({"type": "ai_thinking", "state": True})

                # Retrieve history
                all_msgs = db.query(Message).filter(Message.call_id == call_id).order_by(Message.timestamp).all()
                history = [
                    {"role": "user" if m.speaker == "customer" else "assistant", "content": m.content}
                    for m in all_msgs
                ]

                # Get product config & settings
                product = get_or_create_product_config(db)
                sys_settings = get_or_create_system_settings(db)

                # Generate AI Sales Response
                ai_reply_text = await get_sales_agent_reply(history, product, sys_settings)

                # Store AI message
                ai_msg = Message(
                    call_id=call_id,
                    speaker="ai",
                    content=ai_reply_text
                )
                db.add(ai_msg)
                db.commit()

                # Synthesize TTS
                audio_base64 = None
                if sys_settings.tts_provider in ["edge-tts", "openai"]:
                    audio_base64 = await synthesize_speech(
                        text=ai_reply_text,
                        provider=sys_settings.tts_provider,
                        voice=sys_settings.tts_voice,
                        api_key=sys_settings.openai_api_key
                    )

                # Send AI speech event to client
                await websocket.send_json({
                    "type": "ai_speech",
                    "speaker": "ai",
                    "content": ai_reply_text,
                    "audio_base64": audio_base64,
                    "timestamp": datetime.utcnow().isoformat()
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for call {call_id}")
    except Exception as e:
        logger.error(f"WebSocket error for call {call_id}: {e}")
    finally:
        db.close()
