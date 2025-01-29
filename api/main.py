from fastapi import FastAPI
from routes.audio import router as audio_router

app = FastAPI(
    title="Audio BPM API",
    description="API for handling audio files and BPM information",
    version="1.0.0"
)

app.include_router(audio_router, prefix="/api/v1", tags=["audio"])

@app.get("/")
async def root():
    return {"message": "Welcome to Audio BPM API"}