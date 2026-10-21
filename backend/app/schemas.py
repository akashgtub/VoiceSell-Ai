from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# --- Messages ---
class MessageBase(BaseModel):
    speaker: str # 'customer', 'ai', 'system'
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    call_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Calls ---
class CallCreate(BaseModel):
    recording_consent: bool = False

class CallUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None

class CallEndRequest(BaseModel):
    duration_seconds: Optional[int] = None

class CallSummaryAnalysis(BaseModel):
    summary: str
    customer_requirements: List[str] = []
    objections: List[str] = []
    key_features_discussed: List[str] = []
    buying_signals: List[str] = []
    next_steps: List[str] = []
    status: str # Converted, Interested, Follow-up Required, Not Interested, Demo Requested, No Response

class CallResponse(BaseModel):
    id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: int = 0
    status: str
    original_ai_status: Optional[str] = None
    recording_path: Optional[str] = None
    recording_url: Optional[str] = None
    recording_consent: bool = False
    summary: Optional[str] = None
    customer_requirements: Optional[str] = None
    objections: Optional[str] = None
    next_steps: Optional[str] = None
    key_features_discussed: Optional[str] = None
    buying_signals: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True

class CallDetailResponse(CallResponse):
    messages: List[MessageResponse] = []
    initial_audio_base64: Optional[str] = None

# --- Product Configuration ---
class ProductConfigBase(BaseModel):
    product_name: str
    tagline: str
    description: str
    target_audience: str
    features: str
    benefits: str
    pricing_information: str
    faqs: str
    demo_instructions: str
    contact_information: str

class ProductConfigUpdate(ProductConfigBase):
    pass

class ProductConfigResponse(ProductConfigBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# --- System Settings ---
class SystemSettingsBase(BaseModel):
    ai_provider: str
    ai_model: str
    tts_provider: str
    tts_voice: str
    tts_rate: float
    tts_pitch: float
    stt_provider: str
    auto_record: bool
    require_consent: bool

class SystemSettingsUpdate(SystemSettingsBase):
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

class SystemSettingsResponse(SystemSettingsBase):
    id: int
    has_openai_key: bool
    has_groq_key: bool
    has_gemini_key: bool
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard Stats ---
class StatusCount(BaseModel):
    status: str
    count: int
    color: str

class ActivityDataPoint(BaseModel):
    date: str
    calls: int
    demos: int
    converted: int

class DashboardStats(BaseModel):
    total_calls: int
    converted_leads: int
    interested_leads: int
    demos_requested: int
    follow_ups_required: int
    conversion_rate: float
    status_distribution: List[StatusCount]
    activity_over_time: List[ActivityDataPoint]
    recent_calls: List[CallResponse]

# --- Live Voice Session ---
class LiveSpeechInput(BaseModel):
    text: str
    is_final: bool = True

class LiveSpeechOutput(BaseModel):
    reply_text: str
    audio_base64: Optional[str] = None # Edge-TTS or OpenAI TTS audio if server-synthesized
    detected_intent: Optional[str] = None
