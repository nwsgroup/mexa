from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas import BPMUpdate
from services.audio_service import AudioService

router = APIRouter()
audio_service = AudioService()

from fastapi import APIRouter, UploadFile, File, HTTPException
import mimetypes
import os

router = APIRouter()
audio_service = AudioService()

@router.post("/audio")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio file.
    """
    # Get file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    # List of accepted audio extensions
    accepted_extensions = ['.ogg', '.mp3', '.wav', '.m4a', '.mp4']
    
    if file_ext not in accepted_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension. Accepted extensions are: {', '.join(accepted_extensions)}"
        )
    
    try:
        result = await audio_service.save_audio(file)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/bpm")
async def update_bpm(bpm_data: BPMUpdate):
    """
    Update BPM information.
    """
    try:
        result = await audio_service.update_bpm(bpm_data.bpm)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )