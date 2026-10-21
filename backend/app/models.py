import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0, nullable=False)
    
    # Status: In Progress, Converted, Interested, Follow-up Required, Not Interested, Demo Requested, No Response
    status = Column(String(50), default="In Progress", nullable=False, index=True)
    original_ai_status = Column(String(50), nullable=True) # AI classification preserved if manually modified
    
    # Recording
    recording_path = Column(String(255), nullable=True)
    recording_url = Column(String(255), nullable=True)
    recording_consent = Column(Boolean, default=False, nullable=False)
    
    # AI Summary & Analysis
    summary = Column(Text, nullable=True)
    customer_requirements = Column(Text, nullable=True) # JSON array or bullet text
    objections = Column(Text, nullable=True)            # JSON array or bullet text
    next_steps = Column(Text, nullable=True)            # JSON array or bullet text
    key_features_discussed = Column(Text, nullable=True)# JSON array or bullet text
    buying_signals = Column(Text, nullable=True)        # JSON array or bullet text
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    messages = relationship("Message", back_populates="call", cascade="all, delete-orphan", order_by="Message.timestamp")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    call_id = Column(String(36), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker = Column(String(20), nullable=False) # 'customer' or 'ai' or 'system'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    call = relationship("Call", back_populates="messages")

class ProductConfig(Base):
    __tablename__ = "product_config"

    id = Column(Integer, primary_key=True, default=1)
    product_name = Column(String(100), default="CloudScale CRM Pro", nullable=False)
    tagline = Column(String(255), default="AI-First Revenue Acceleration Platform for B2B Teams", nullable=False)
    description = Column(Text, default="CloudScale CRM Pro is an all-in-one revenue acceleration platform combining predictive lead scoring, voice AI workflows, multi-channel automated outreach, and real-time deal pipeline visibility for modern sales teams.", nullable=False)
    target_audience = Column(Text, default="B2B SaaS companies, high-growth sales teams, mid-market enterprises with 10-500 sales reps seeking to increase quota attainment.", nullable=False)
    features = Column(Text, default="""[
  {"name": "Predictive Lead Scoring", "description": "Machine learning scoring that ranks deals by conversion likelihood with 94% accuracy."},
  {"name": "Voice AI Agent Workflows", "description": "Autonomous voice agents that conduct discovery calls, qualify inbound leads 24/7, and log CRM transcripts automatically."},
  {"name": "Multi-Channel Sequence Automation", "description": "Unified email, LinkedIn, and SMS cadences tailored to buyer intent signals."},
  {"name": "Real-Time Pipeline Analytics", "description": "Interactive revenue forecasting, deal velocity charts, and rep activity heatmaps."}
]""", nullable=False)
    benefits = Column(Text, default="""[
  "Shorten sales cycles by 38% through immediate automated lead qualification.",
  "Eliminate 15+ hours per rep weekly on manual CRM data entry and call note logging.",
  "Boost pipeline conversion by 2.4x with automated personalized follow-up cadences."
]""", nullable=False)
    pricing_information = Column(Text, default="""[
  {"tier": "Starter", "price": "$49 / user / month", "billing": "Billed annually or $59 monthly", "features": ["Up to 5 sales reps", "Core CRM & Pipeline", "100 AI voice qualification minutes/mo", "Email sequencing", "Standard support"]},
  {"tier": "Growth", "price": "$99 / user / month", "billing": "Billed annually or $119 monthly", "features": ["Up to 25 sales reps", "Predictive Lead Scoring", "500 AI voice qualification minutes/mo", "Multi-channel automation", "CRM 2-way sync (Salesforce, HubSpot)", "Priority support"]},
  {"tier": "Enterprise", "price": "Custom / starts at $199 / user / mo", "billing": "Annual agreement", "features": ["Unlimited reps", "Unlimited AI voice minutes", "Dedicated account manager & SLA", "Custom security & HIPAA / SOC2 compliant", "Custom integrations & API"]}
]""", nullable=False)
    faqs = Column(Text, default="""[
  {"question": "How quickly can we get onboarded?", "answer": "Most teams are up and running in under 24 hours. We offer one-click integrations with Salesforce, HubSpot, and Google Workspace."},
  {"question": "Is there a free trial available?", "answer": "Yes, we offer a 14-day fully-featured free trial with no credit card required, plus guided onboarding."},
  {"question": "Can your AI Voice agent handle multiple languages?", "answer": "Yes, our voice agents currently support English, Spanish, German, French, and Portuguese with native accents."},
  {"question": "Is our customer conversation data secure?", "answer": "Absolutely. All voice recordings and transcripts are encrypted in transit and at rest with AES-256 and SOC-2 Type II certification."}
]""", nullable=False)
    demo_instructions = Column(Text, default="To schedule a live interactive 20-minute demonstration, customers can pick a time slot at voxsell.ai/demo or provide their work email and phone number, and a Senior Solutions Consultant will send an instant calendar invite within 5 minutes.", nullable=False)
    contact_information = Column(Text, default="Email: sales@voxsell.ai | Phone: +1 (800) 555-VOICE | Website: https://voxsell.ai | Office: 500 Howard St, San Francisco, CA", nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    ai_provider = Column(String(50), default="local", nullable=False) # local, openai, groq, gemini
    ai_model = Column(String(100), default="auto", nullable=False)
    openai_api_key = Column(String(255), default="", nullable=False)
    groq_api_key = Column(String(255), default="", nullable=False)
    gemini_api_key = Column(String(255), default="", nullable=False)
    
    tts_provider = Column(String(50), default="edge-tts", nullable=False) # edge-tts, browser, openai
    tts_voice = Column(String(100), default="en-US-AriaNeural", nullable=False)
    tts_rate = Column(Float, default=1.0, nullable=False)
    tts_pitch = Column(Float, default=1.0, nullable=False)
    
    stt_provider = Column(String(50), default="browser", nullable=False) # browser, whisper
    auto_record = Column(Boolean, default=True, nullable=False)
    require_consent = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
