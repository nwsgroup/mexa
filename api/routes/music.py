from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from services.music_generator import MusicGeneratorService
from schemas import BPMRequest
import traceback

router = APIRouter()
music_service = MusicGeneratorService()

from midiutil import MIDIFile
from pydub import AudioSegment
import io
import subprocess
import tempfile
import os

import uuid

@router.post("/generate")
async def generate_music(bpm_request: BPMRequest):
    """
    Generate calming music based on the provided BPM
    """
    try:
        # Generar MIDI primero
        midi_data = await music_service.generate_music(bpm_request.bpm)
        
        # Crear archivos temporales para la conversión
        with tempfile.NamedTemporaryFile(suffix='.mid', delete=False) as midi_temp:
            midi_temp.write(midi_data)
            midi_path = midi_temp.name

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as wav_temp:
            wav_path = wav_temp.name

        try:
            # Convertir MIDI a WAV usando fluidsynth
            subprocess.run([
                'fluidsynth',
                '-ni',
                '/usr/share/sounds/sf2/FluidR3_GM.sf2',  # Ruta al soundfont
                midi_path,
                '-F',
                wav_path,
                '-r',
                '44100'
            ], check=True)

            # Convertir WAV a MP3
            audio = AudioSegment.from_wav(wav_path)
            mp3_io = io.BytesIO()
            audio.export(mp3_io, format="mp3")
            mp3_data = mp3_io.getvalue()

            # Generator random uuid
            uuid_str = str(uuid.uuid4())

            return Response(
                content=mp3_data,
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": f"attachment; filename=calm_music_{uuid_str}bpm.mp3"
                }
            )
        finally:
            # Limpiar archivos temporales
            for path in [midi_path, wav_path]:
                try:
                    os.unlink(path)
                except OSError:
                    pass

    except Exception as e:
        print(e)
        print(traceback.format_exc())
        
        raise HTTPException(
            status_code=500,
            detail=f"Error generating music: {str(e)}"
        )