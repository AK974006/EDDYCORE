from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

# Create app
app = FastAPI(title="EDDYCORE Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure storage directory exists
STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

# Import and include routers (to be created)
from backend.storage import router as storage_router
from backend.eddie import router as eddie_router
from backend.settings import router as settings_router
app.include_router(storage_router, prefix="/api/storage", tags=["Storage"])
app.include_router(eddie_router, prefix="/api/eddie", tags=["Eddie"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# Serve built frontend if present (points to web_ui/dist)
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web_ui", "dist"))
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
