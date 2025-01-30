# Aletheia

<img src="./AletheiaAppNew/assets/images/icon.png"  width="200" height="200" center alt="icon">

## Overview

Atheleia is an emotional regulator that synchronizes heart rate with music to progressively reduce anxiety, anger, or fear by gradually slowing down the music's BPM (beats per minute). In cases of sadness, it increases the heart rate to bring the user back to a baseline emotional state. The app also includes a diary feature where users can record their thoughts and feelings, which can be shared with their therapist. The therapist receives audio recordings, transcriptions, and detected irrational thoughts, allowing for better context understanding and treatment adjustments.  

## Features

* Audio Processing: Captures and processes audio input for sentiment analysis and classification and keep these audios as notes in a journal

* Generation Music: Using the heart beats per minute or (BPMs) generates audio with piano notes to help regulate altered modos, using MIDI files.

* Personal diary: keeps a personal diary of voice notes that are classified by sentiment and contain a description of detected irrational ideas

## Repository Structure

* `/AletheiaAppNew` : It is the application in reac-native  
    * install the necessary packages with `npm install`.
    * change the url in the fetches to that of your environment.
        * `heartbeat.ts`
        * `voice_note.ts`

* `/api` : This is the backend of the application built in fastapi
    * install the `requirements.txt`.
    * add to gemini api key in `.env`.
    * the routes are as follows:
        * Upload Audio: `POST /api/v1/audio`
            
            Upload an audio file and analyze it.
            Request Body (multipart/form-data):
            
            ``file`` (binary, required): The audio file to upload

            Response (200):

            ```json
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
            ```
        * Update BPM : `POST /api/v1/bpm`

            Update BPM information.

            Request Body:

            ```json
            {
                "bpm": number // Beats per minute value (minimum: 0.0)
            }
            ```

            Response (200):

            ```json
            {
                "message": "string",
                "bpm": number,
                "success": boolean
            }
            ```

        * Generate Music : `POST /api/v1/generate`

        Generate calming music based on the provided BPM.
        Request Body:

        ```json
        {
            "bpm": number // Beats per minute (minimum: 20.0, maximum: 200.0)
        }
        ```

        Response (200): File mp3 

        `Nota : if you are using linux and have problems generating the insta file to fluidsynth on the system`


## Usage Example
[Ver video de uso](/docs/Video_app.mp4)

## Figma videos
### User interface
[Ver video de interfaz de usuario](/docs/aletheia_user_figma.mp4)

### Doc interface
[Ver video de interfaz de documentación](/docs/aletheia_doc_figma.mp4)
