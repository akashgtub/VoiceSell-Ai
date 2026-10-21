import pytest
import io
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Call, Message, ProductConfig

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    # Fresh setup
    Base.metadata.create_all(bind=engine)
    yield
    # No drop to allow test inspection if needed

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_dashboard_stats_empty():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_calls" in data
    assert "conversion_rate" in data
    assert "status_distribution" in data
    assert "activity_over_time" in data

def test_product_config_endpoints():
    # Get config
    get_res = client.get("/api/product")
    assert get_res.status_code == 200
    prod_data = get_res.json()
    assert "product_name" in prod_data

    # Update config
    prod_data["product_name"] = "CloudScale CRM Enterprise"
    put_res = client.put("/api/product", json=prod_data)
    assert put_res.status_code == 200
    assert put_res.json()["product_name"] == "CloudScale CRM Enterprise"

def test_call_lifecycle_and_classification():
    # 1. Start Call with recording consent
    start_res = client.post("/api/calls", json={"recording_consent": True})
    assert start_res.status_code == 200
    call_data = start_res.json()
    call_id = call_data["id"]
    assert call_data["recording_consent"] is True
    assert call_data["status"] == "In Progress"
    assert len(call_data["messages"]) >= 1 # Initial AI greeting

    # 2. Exchange Customer message (asking for demo)
    msg_res = client.post(
        f"/api/calls/{call_id}/messages",
        json={"speaker": "customer", "content": "Could you tell me how much this costs, and can I schedule a live demo for my team?"}
    )
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert "reply_text" in msg_data
    assert len(msg_data["reply_text"]) > 10

    # 3. End Call
    end_res = client.post(
        f"/api/calls/{call_id}/end",
        json={"duration_seconds": 95}
    )
    assert end_res.status_code == 200
    ended_call = end_res.json()
    assert ended_call["duration_seconds"] == 95
    assert ended_call["summary"] is not None
    # Because customer asked for demo, status should be Demo Requested
    assert ended_call["status"] == "Demo Requested"
    assert ended_call["original_ai_status"] == "Demo Requested"

    # 4. Upload genuine recording
    dummy_audio = io.BytesIO(b"RIFF....WAVEfmt ....data....test_audio_bytes")
    upload_res = client.post(
        f"/api/calls/{call_id}/recording",
        files={"file": ("call_sample.wav", dummy_audio, "audio/wav")}
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["success"] is True

    # 5. Verify recording stream
    stream_res = client.get(f"/api/calls/{call_id}/recording")
    assert stream_res.status_code == 200
    assert stream_res.headers["content-type"].startswith("audio/")

    # 6. Manual status override (audit check)
    patch_res = client.patch(
        f"/api/calls/{call_id}/status",
        json={"status": "Converted", "notes": "Customer confirmed deal over follow-up email."}
    )
    assert patch_res.status_code == 200
    patch_data = patch_res.json()
    assert patch_data["status"] == "Converted"
    # Original AI status must be preserved for auditing
    assert patch_data["original_ai_status"] == "Demo Requested"

def test_settings_endpoints():
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    settings_data = get_res.json()
    assert "ai_provider" in settings_data
    assert "tts_provider" in settings_data

    # Update settings
    update_payload = {
        "ai_provider": "local",
        "ai_model": "auto",
        "tts_provider": "edge-tts",
        "tts_voice": "en-US-AriaNeural",
        "tts_rate": 1.0,
        "tts_pitch": 1.0,
        "stt_provider": "browser",
        "auto_record": True,
        "require_consent": True
    }
    put_res = client.put("/api/settings", json=update_payload)
    assert put_res.status_code == 200
    assert put_res.json()["tts_voice"] == "en-US-AriaNeural"
