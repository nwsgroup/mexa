from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas import BPMUpdate
from services.audio_service import AudioService
from typing import Dict
import mimetypes
import os
import json
from pydantic import BaseModel
from typing import List, Optional

class IrrationalIdea(BaseModel):
    title: str
    description: str

class AudioAnalysisResponse(BaseModel):
    message: str
    filename: str
    analysis: Dict
    success: bool = True

router = APIRouter()
audio_service = AudioService()

@router.post("/audio", response_model=AudioAnalysisResponse)
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio file and analyze it.
    Returns:
    {
        "message": "string",
        "filename": "string",
        "success": boolean,
        "analysis": {
            "transcript": "string",
            "classification": "string",
            "irrational_ideas": [
                {
                    "title": "string",
                    "description": "string"
                }
            ]
        }
    }
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
        
        # If the analysis is returned as a string (JSON), parse it
        if isinstance(result["analysis"], str):
            try:
                result["analysis"] = json.loads(result["analysis"])
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to parse analysis result"
                )
        
        return AudioAnalysisResponse(
            message=result["message"],
            filename=result["filename"],
            analysis=result["analysis"],
            success=True
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

class BPMResponse(BaseModel):
    message: str
    bpm: float
    success: bool = True

@router.post("/bpm", response_model=BPMResponse)
async def update_bpm(bpm_data: BPMUpdate):
    """
    Update BPM information.
    Returns:
    {
        "message": "string",
        "bpm": float,
        "success": boolean
    }
    """
    try:
        result = await audio_service.update_bpm(bpm_data.bpm)
        return BPMResponse(
            message=result["message"],
            bpm=result["bpm"],
            success=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )