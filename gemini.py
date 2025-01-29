import os
import json
import google.generativeai as genai
from process import text_to_midi


genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model
generation_config = {
    "temperature": 0.55,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 65536,
    "response_mime_type": "text/plain",
}

PROMPT = "                \"You are a MIDI music expert specializing in calm, relaxing music. Generate MIDI data following this exact structure for calming music:\\n\\nKey structure points:\\n1. Note Format: [delta_time, note_number, velocity, duration]\\n   - delta_time: Time since last note (can be negative for overlapping notes)\\n   - note_number: 49-75 range works well for calm music (based on example)\\n   - velocity: Use 50 for gentle, consistent volume\\n   - duration: Use multiples of 384 ticks (384=quarter, 768=half, 1152=dotted half, 1920=whole note+)\\n\\n2. Musical Patterns from the Example:\\n   - Use overlapping notes with negative delta_times (-768, -1152, etc.)\\n   - Create gentle arpeggios with notes 61-70\\n\\n3. Time Signature and Tempo:\\n   - Use [\\\"s\\\", 0, 4, 4] for 4/4 time signature\\n   - Use [\\\"t\\\", 0, 130] for tempo (or slower for more relaxing effect)\\n\\n4. Structure:\\n{\\n    \\\"q\\\": 384,              // Ticks per beat - keep this exact value\\n    \\\"t\\\": [{                // Single track is fine for calm music\\n        \\\"n\\\": [             // Notes array with format [delta_time, note_number, velocity, duration]\\n            [0, 70, 50, 768],   // Example of a half note\\n            [0, 66, 50, 768],   // Simultaneous note (chord)\\n            [768, 68, 50, 384],  // Next note after one half note\\n            [-768, 49, 50, 1152] // Overlapping bass note\\n        ]\\n    }],\\n    \\\"g\\\": [                // Global events - keep exactly this format\\n        [\\\"s\\\", 0, 4, 4],   // Time signature: 4/4\\n        [\\\"t\\\", 0, 130]     // Tempo: 130 BPM or lower\\n    ]\\n}\\n\\nImportant Rules:\\n1. Always use string format for global events (g)\\n2. Keep notes between 49-75 for gentle sound\\n3. Use velocity 50 consistently\\n4. Use note durations that are multiples of 384\\n5. Include overlapping notes using negative delta_times\\n6. Maintain a consistent, calm pattern similar to the example\\n7. Never leave silent gaps - notes should connect smoothly\\n8. Use longer durations (768, 1152, 1920) for a calming effect\\n",

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-thinking-exp-01-21",
    generation_config=generation_config,
  system_instruction=PROMPT
)

chat_session = model.start_chat(
    history=[
    ]
)

response = chat_session.send_message("generate a new calm music, based on the example, doesnt modify it too much. give me the response in a json file, respect the structure")

# Clean up the response text
response_text = response.text
clean_json = response_text.replace("```json", "").replace("```", "").strip()

# Parse the cleaned JSON
parsed_json = json.loads(clean_json)

# Save the parsed JSON with proper formatting
with open("output_gemini.json", "w") as f:
    json.dump(parsed_json, f, indent=2)

text_to_midi(parsed_json, "output.mid")