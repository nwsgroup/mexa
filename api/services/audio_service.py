from fastapi import UploadFile
import os
import google.generativeai as genai
from typing import Dict, List
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

VALID_TAGS = [
    "daily_reflection",     # General daily thoughts and experiences
    "emotional_vent",       # Emotional release or frustration
    "goal_setting",        # Future plans and objectives
    "problem_solving",     # Discussing specific problems
    "anxiety_expression",  # Anxiety-related thoughts
    "gratitude",          # Expressions of thankfulness
    "interpersonal",      # Relationship-related content
    "self_criticism",     # Self-critical thoughts
    "achievement",        # Accomplishments and progress
    "uncertainty"         # Doubts and unclear situations
]

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
            "response_mime_type": "application/json",
        }
        
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=generation_config,
        )
    
    def upload_to_gemini(self, path: str, mime_type: str = None):
        """Uploads the given file to Gemini."""
        file = genai.upload_file(path, mime_type=mime_type)
        print(f"Uploaded file '{file.display_name}' as: {file.uri}")
        return file
    
    def _get_analysis_prompt(self) -> str:
        """Returns the prompt for analyzing the audio content."""
        return f"""
        Analyze the audio transcription and provide a structured response in the following JSON format:
        {{
            "transcript": "the exact transcription of the audio",
            "classification": "ONE tag from this list: {VALID_TAGS}",
            "irrational_ideas": [
                {{
                    "title": "name of the irrational idea",
                    "description": "detailed explanation of why this is irrational"
                }}
            ]
        }}

        Rules for analysis:
        1. The transcript should be verbatim
        2. Choose exactly ONE classification tag that best represents the content
        3. Identify any irrational thoughts or cognitive distortions present
        4. For each irrational idea, provide a clear title and detailed explanation
        5. If no irrational ideas are found, return an empty list for irrational_ideas
        6. Ensure the output is valid JSON format
        """
        
    async def save_audio(self, file: UploadFile) -> Dict:
        """
        Save the uploaded audio file and analyze it using Gemini.
        Returns transcript, classification, and identified irrational ideas.
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
                            self._get_analysis_prompt(),
                        ],
                    }
                ]
            )
            
            response = chat_session.send_message("Please analyze the audio content")
            
            analysis = response.text
            
            return {
                "message": "Audio file processed successfully",
                "filename": file.filename,
                "analysis": analysis
            }
            
        except Exception as e:
            raise Exception(f"Error processing audio file: {str(e)}")
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
    
    async def update_bpm(self, bpm: float) -> Dict:
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