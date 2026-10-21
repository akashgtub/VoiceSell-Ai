from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SystemSettings
from app.schemas import SystemSettingsResponse, SystemSettingsUpdate
from app.services.product_service import get_or_create_system_settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SystemSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    s = get_or_create_system_settings(db)
    return SystemSettingsResponse(
        id=s.id,
        ai_provider=s.ai_provider,
        ai_model=s.ai_model,
        tts_provider=s.tts_provider,
        tts_voice=s.tts_voice,
        tts_rate=s.tts_rate,
        tts_pitch=s.tts_pitch,
        stt_provider=s.stt_provider,
        auto_record=s.auto_record,
        require_consent=s.require_consent,
        has_openai_key=bool(s.openai_api_key and len(s.openai_api_key.strip()) > 5),
        has_groq_key=bool(s.groq_api_key and len(s.groq_api_key.strip()) > 5),
        has_gemini_key=bool(s.gemini_api_key and len(s.gemini_api_key.strip()) > 5),
        updated_at=s.updated_at
    )

@router.put("", response_model=SystemSettingsResponse)
def update_settings(update_in: SystemSettingsUpdate, db: Session = Depends(get_db)):
    s = get_or_create_system_settings(db)

    s.ai_provider = update_in.ai_provider
    s.ai_model = update_in.ai_model
    s.tts_provider = update_in.tts_provider
    s.tts_voice = update_in.tts_voice
    s.tts_rate = update_in.tts_rate
    s.tts_pitch = update_in.tts_pitch
    s.stt_provider = update_in.stt_provider
    s.auto_record = update_in.auto_record
    s.require_consent = update_in.require_consent

    # Only update keys if a non-empty string was supplied
    if update_in.openai_api_key is not None and update_in.openai_api_key != "":
        s.openai_api_key = update_in.openai_api_key.strip()
    if update_in.groq_api_key is not None and update_in.groq_api_key != "":
        s.groq_api_key = update_in.groq_api_key.strip()
    if update_in.gemini_api_key is not None and update_in.gemini_api_key != "":
        s.gemini_api_key = update_in.gemini_api_key.strip()

    db.commit()
    db.refresh(s)

    return SystemSettingsResponse(
        id=s.id,
        ai_provider=s.ai_provider,
        ai_model=s.ai_model,
        tts_provider=s.tts_provider,
        tts_voice=s.tts_voice,
        tts_rate=s.tts_rate,
        tts_pitch=s.tts_pitch,
        stt_provider=s.stt_provider,
        auto_record=s.auto_record,
        require_consent=s.require_consent,
        has_openai_key=bool(s.openai_api_key and len(s.openai_api_key.strip()) > 5),
        has_groq_key=bool(s.groq_api_key and len(s.groq_api_key.strip()) > 5),
        has_gemini_key=bool(s.gemini_api_key and len(s.gemini_api_key.strip()) > 5),
        updated_at=s.updated_at
    )
