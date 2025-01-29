import os
import json
import google.generativeai as genai
import tempfile


class MusicGeneratorService:
    def __init__(self):
        self.setup_gemini()
        self.load_examples()
        
    def setup_gemini(self):
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        self.generation_config = {
            "max_output_tokens": 65536,
            "response_mime_type": "text/plain",
        }
        
    def load_examples(self):
        # Load example JSON files
        def load_json_example(filename):
            with open(filename, 'r') as f:
                return json.dumps(json.load(f), indent=2)
                
        self.example1 = load_json_example("calm.json")
        self.example2 = load_json_example("calm2.json")
        self.example3 = load_json_example("rivers.json")
        
    def create_prompt(self, target_bpm):
        return f"""You are a MIDI music expert specializing in calm songs, relaxing music. Generate MIDI data following this exact structure for calming music, based on these three examples:

Key structure points:
1. Note Format: [delta_time, note_number, velocity, duration]
   - delta_time: Time since last note (can be negative for overlapping notes)
   - note_number: 49-75 range works well for calm music (based on examples)
   - velocity: Use 50 for gentle, consistent volume
   - duration: Use multiples of 384 ticks (384=quarter, 768=half, 1152=dotted half, 1920=whole note+)

2. Musical Patterns from the Examples:
   - Use overlapping notes with negative delta_times (-768, -1152, etc.)
   - Create gentle arpeggios with notes 61-70

3. Time Signature and Tempo:
   - Use ["s", 0, 4, 4] for 4/4 time signature
   - Use ["t", 0, 130] for tempo (or slower for more relaxing effect)

4. Structure:
{{
    "q": 384,              // Ticks per beat - keep this exact value
    "t": [{{                // Single track is fine for calm music
        "n": [             // Notes array with format [delta_time, note_number, velocity, duration]
            [0, 70, 50, 768],   // Example of a half note
            [0, 66, 50, 768],   // Simultaneous note (chord)
            [768, 68, 50, 384],  // Next note after one half note
            [-768, 49, 50, 1152] // Overlapping bass note
        ]
    }}],
    "g": [                // Global events - keep exactly this format
        ["s", 0, 4, 4],   // Time signature: 4/4
        ["t", 0, 130]     // Tempo: 130 BPM or lower
    ]
}}

Important Rules:
1. Always use string format for global events (g)
2. Combine notes! make it good to listen! the examples have a good listening


Example 1, note the details:
{self.example1}

Example 2, note the details:
{self.example2}

Example 3, note the details:
{self.example3}

first analyze each song,give the same importance to each song, they are very good calm songs, use this examples as inspiration for the generated music, add your unique point for the generated song, make each generated song unique
[MANDATORY]: follow the structure of the json """
        
    async def generate_music(self, bpm: float) -> bytes:
        prompt = self.create_prompt(bpm)

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-thinking-exp-01-21",
            generation_config=self.generation_config,
            system_instruction=prompt
        )
        
        chat_session = model.start_chat()
        response = chat_session.send_message("generate a new calm music, based on the examples, but be creative!, combining elements from both while maintaining the peaceful atmosphere. give me the response in a json file, respect the structure, it is mandatory. note the details they are very important. think for long time. ")
        
        # Clean and parse response
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        parsed_json = json.loads(clean_json)

        # Create temporary files for JSON and MIDI
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as json_file:
            json.dump(parsed_json, json_file, indent=2)
            json_path = json_file.name
            
        with tempfile.NamedTemporaryFile(suffix='.mid', delete=False) as midi_file:
            midi_path = midi_file.name
        
        try:
            # Convert JSON to MIDI
            self.text_to_midi(parsed_json, midi_path)
            
            # Read the MIDI file in binary mode
            with open(midi_path, 'rb') as f:
                midi_data = f.read()
                
            return midi_data
            
        finally:
            # Cleanup temporary files
            for path in [json_path, midi_path]:
                if os.path.exists(path):
                    os.remove(path)
                    
    def text_to_midi(self, json_data, output_file):
        from process import text_to_midi
        text_to_midi(json_data, output_file)