from fastapi import FastAPI
from routes import audio, music

app = FastAPI(
    title="Audio Processing API",
    description="API for handling audio files and music generation",
    version="1.0.0"
)

app.include_router(audio.router, prefix="/api/v1", tags=["audio"])
app.include_router(music.router, prefix="/api/v1", tags=["music"])

@app.get("/")
async def root():
    return {"message": "Welcome to Audio BPM API"}