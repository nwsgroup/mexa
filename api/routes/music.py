from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from services.music_generator import MusicGeneratorService
from schemas import BPMRequest
import traceback

router = APIRouter()
music_service = MusicGeneratorService()

@router.post("/generate")
async def generate_music(bpm_request: BPMRequest):
    """
    Generate calming music based on the provided BPM
    """
    try:
        mp3_data = await music_service.generate_music(bpm_request.bpm)
        
        # Return MP3 file
        return Response(
            content=mp3_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=calm_music_{bpm_request.bpm}bpm.mp3"
            }
        )
    except Exception as e:
        print(e)
        print(traceback.format_exc())

        raise HTTPException(
            status_code=500,
            detail=f"Error generating music: {str(e)}"
        )