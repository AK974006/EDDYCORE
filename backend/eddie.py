import io
import speech_recognition as sr
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe a WAV audio file to text using Google's free STT.
    """
    try:
        content = await audio.read()
        r = sr.Recognizer()
        
        # AudioFile expects a file-like object
        with sr.AudioFile(io.BytesIO(content)) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data)
            return {"text": text}
    except sr.UnknownValueError:
        return {"error": "Could not understand audio"}
    except sr.RequestError as e:
        return {"error": f"Service error: {e}"}
    except Exception as e:
        return {"error": str(e)}

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemma-3-27b-it:free"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@router.post("/chat")
async def chat_with_eddie(request: ChatRequest):
    """
    Chat with Eddie AI using OpenRouter API (Gemini 2.0 Flash)
    """
    if not OPENROUTER_API_KEY:
        return {
            "response": "Eddie AI is not configured. Please set OPENROUTER_API_KEY in your .env file.",
            "error": "missing_api_key"
        }
    
    try:
        # Build conversation history
        messages = [
            {
                "role": "system",
                "content": "You are Eddie, an advanced AI assistant integrated into EDDYCORE. You are helpful, concise, and friendly. You can help users with tasks, answer questions, and control applications."
            }
        ]
        
        # Add conversation history (limit to last 10 messages to avoid token limits)
        if request.history:
            for msg in request.history[-10:]:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call OpenRouter API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "EDDYCORE - Eddie AI"
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            )
            
            if response.status_code != 200:
                error_text = response.text
                print(f"OpenRouter API Error: {response.status_code} - {error_text}")
                print(f"API Key being used: {OPENROUTER_API_KEY[:20]}..." if OPENROUTER_API_KEY else "No API Key!")
                print(f"Model requested: {MODEL}")
                
                # Try to parse error for better user message
                try:
                    error_json = response.json()
                    error_msg = error_json.get('error', {}).get('message', error_text)
                except:
                    error_msg = error_text
                    
                return {
                    "response": f"API Error ({response.status_code}): {error_msg}",
                    "error": error_text
                }
            
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            
            return {
                "response": ai_response,
                "model": MODEL
            }
            
    except httpx.TimeoutException:
        return {
            "response": "The request timed out. Please try again.",
            "error": "timeout"
        }
    except Exception as e:
        print(f"Eddie AI Error: {str(e)}")
        return {
            "response": "I encountered an unexpected error. Please try again.",
            "error": str(e)
        }
