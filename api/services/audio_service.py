from fastapi import UploadFile
import os
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

class AudioService:
    def __init__(self):
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 65536,
            "response_mime_type": "text/plain",
        }
        
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=generation_config,
        )
    
    def upload_to_gemini(self, path, mime_type=None):
        """Uploads the given file to Gemini."""
        file = genai.upload_file(path, mime_type=mime_type)
        print(f"Uploaded file '{file.display_name}' as: {file.uri}")
        return file
        
    async def save_audio(self, file: UploadFile) -> dict:
        """
        Save the uploaded audio file and transcribe it using Gemini.
        """
        file_path = os.path.join(self.upload_dir, file.filename)
        
        try:
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            uploaded_file = self.upload_to_gemini(file_path, mime_type="audio/ogg")
            
            chat_session = self.model.start_chat(
                history=[
                    {
                        "role": "user",
                        "parts": [
                            uploaded_file,
                            "transcribe this audio file",
                        ],
                    }
                ]
            )
            
            response = chat_session.send_message("Please provide the transcription")
            transcription = response.text
            
            return {
                "message": "Audio file uploaded and transcribed successfully",
                "filename": file.filename,
                "transcription": transcription
            }
            
        except Exception as e:
            raise Exception(f"Error processing audio file: {str(e)}")
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
    
    async def update_bpm(self, bpm: float) -> dict:
        """
        Update BPM information.
        """
        try:
            return {
                "message": "BPM updated successfully",
                "bpm": bpm
            }
        except Exception as e:
            raise Exception(f"Error updating BPM: {str(e)}")