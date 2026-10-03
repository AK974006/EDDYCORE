from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json

router = APIRouter()

# Define settings path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETTINGS_FILE = os.path.join(BASE_DIR, "storage", "settings.json")

class WallpaperSettings(BaseModel):
    wallpaper: str

def load_settings():
    """Load settings from JSON file"""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {"wallpaper": "/default-wallpaper.jpg"}
    return {"wallpaper": "/default-wallpaper.jpg"}

def save_settings(settings):
    """Save settings to JSON file"""
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f, indent=2)

@router.get("/wallpaper")
async def get_wallpaper():
    """Get current wallpaper setting"""
    settings = load_settings()
    return {"wallpaper": settings.get("wallpaper", "/default-wallpaper.jpg")}

@router.post("/wallpaper")
async def set_wallpaper(data: WallpaperSettings):
    """Set wallpaper"""
    settings = load_settings()
    settings["wallpaper"] = data.wallpaper
    save_settings(settings)
    return {"status": "success", "wallpaper": data.wallpaper}

@router.get("/all")
async def get_all_settings():
    """Get all settings"""
    return load_settings()


@router.post("/all")
async def save_all_settings(data: dict):
    """Save arbitrary settings payload to disk"""
    try:
        save_settings(data)
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
