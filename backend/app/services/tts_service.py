import io
import base64
import logging
import asyncio
from typing import Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

async def generate_speech_edge(text: str, voice: str = "en-US-AriaNeural", rate: str = "+0%", pitch: str = "+0Hz") -> Optional[bytes]:
    """
    Generates high-quality neural voice speech using edge-tts (free Microsoft neural voices).
    """
    async def _run():
        import edge_tts
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
        return audio_stream.getvalue()

    try:
        audio_bytes = await asyncio.wait_for(_run(), timeout=8.0)
        if audio_bytes:
            return audio_bytes
    except Exception as e:
        logger.warning(f"Edge-TTS synthesis error: {e}")
    return None

async def generate_speech_openai(text: str, api_key: str, voice: str = "alloy") -> Optional[bytes]:
    """
    Generates speech using OpenAI TTS API if key is provided.
    """
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/audio/speech",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "tts-1",
                    "input": text,
                    "voice": voice if voice in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] else "alloy",
                    "response_format": "mp3"
                }
            )
            if resp.status_code == 200:
                return resp.content
    except Exception as e:
        logger.warning(f"OpenAI TTS synthesis error: {e}")
    return None

async def synthesize_speech(text: str, provider: str = "edge-tts", voice: str = "en-US-AriaNeural", api_key: str = "") -> Optional[str]:
    """
    Returns audio encoded in base64 data URI (audio/mp3).
    Returns None if client-side browser speech synthesis should be used.
    """
    audio_bytes = None
    if provider == "openai" and api_key:
        audio_bytes = await generate_speech_openai(text, api_key, voice)
    
    if not audio_bytes and provider in ["edge-tts", "auto", "default"]:
        audio_bytes = await generate_speech_edge(text, voice)
        
    if audio_bytes:
        encoded = base64.b64encode(audio_bytes).decode("utf-8")
        return f"data:audio/mp3;base64,{encoded}"
        
    return None
