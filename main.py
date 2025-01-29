import os
import json
from typing import List
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from process import text_to_midi
from pydantic_ai.settings import ModelSettings

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")


from typing import List
from pydantic import BaseModel, Field

class MidiTrack(BaseModel):
    """
    Represents a MIDI track containing musical notes and instrument information.
    Each track typically represents a different voice or instrument in the piece.
    """
    n: List[List[int]] = Field(
        description=(
            "Array of notes where each note is [delta_time, note_number, velocity, duration]:\n"
        )
    )
    i: int = Field(
        default=0,
        description=(
            "Instrument program number (0-127):\n"
            "0=piano, 32=bass, 48=strings, 73=flute\n"
            "Default is 0 (piano) if not specified"
        )
    )

class MidiStructure(BaseModel):
    """
    Represents the complete MIDI file structure including timing, tracks, and global events.
    This structure is optimized for creating calm, gentle music with proper musical timing.
    """
    q: int = Field(
        default=384,  # Changed to match example
        description=(
            "Ticks per beat (MIDI time division)\n"
            "384 is recommended for calm music timing\n"
            "Used to calculate note durations and timing"
        )
    )
    t: List[MidiTrack] = Field(
        description=(
            "Array of MIDI tracks, each containing notes and instrument info\n"
            "Single track is typical for simple, calm pieces\n"
            "Multiple tracks can be used for complex arrangements, make creative combinations"
        )
    )
    g: List[List[str]] = Field(
        default=[["s", "0", "4", "4"]],  
        description=(
            "Global events controlling timing and structure (all values as strings):\n"
            "Time signature: ['s', '0', '4', '4'] (4/4 time)\n"
            "Tempo: ['t', '0', '130'] (130 BPM or lower for calm music)\n"
            "First value: event type ('s'=time signature, 't'=tempo)\n"
            "Second value: time offset (typically '0')\n"
            "Remaining values: event-specific parameters. be creative changing this. ones"
        )
    )


def load_example_json(example_path: str) -> str:
    """Load and format example JSON file"""
    try:
        with open(example_path, 'r') as f:
            example_data = json.load(f)
        return json.dumps(example_data)
    except Exception as e:
        print(f"Warning: Could not load example file: {e}")
        return ""



def get_midi_context(example_path: str = None) -> str:
    example_section = ""
    if example_path:
        example_json = load_example_json(example_path)
        if example_json:
            example_section = f"\nHere's a concrete example of a valid MIDI structure from Minecraft's calm music:\n{example_json}\n"

    MIDI_PROMPT = '''You are a MIDI music expert specializing in calm, relaxing music. Generate MIDI data following this exact structure for calming music:

Key structure points:
1. Note Format: [delta_time, note_number, velocity, duration]
   - delta_time: Time since last note (can be negative for overlapping notes)
   - note_number: 49-75 range works well for calm music (based on example)
   - velocity: Use 50 for gentle, consistent volume
   - duration: Use multiples of 384 ticks (384=quarter, 768=half, 1152=dotted half, 1920=whole note+)

2. Musical Patterns from the Example:
   - Use overlapping notes with negative delta_times (-768, -1152, etc.)
   - Create gentle arpeggios with notes 61-70

3. Time Signature and Tempo:
   - Use ["s", 0, 4, 4] for 4/4 time signature
   - Use ["t", 0, 130] for tempo (or slower for more relaxing effect)

4. Structure:
{
    "q": 384,              // Ticks per beat - keep this exact value
    "t": [{                // Single track is fine for calm music
        "n": [             // Notes array with format [delta_time, note_number, velocity, duration]
            [0, 70, 50, 768],   // Example of a half note
            [0, 66, 50, 768],   // Simultaneous note (chord)
            [768, 68, 50, 384],  // Next note after one half note
            [-768, 49, 50, 1152] // Overlapping bass note
        ]
    }],
    "g": [                // Global events - keep exactly this format
        ["s", 0, 4, 4],   // Time signature: 4/4
        ["t", 0, 130]     // Tempo: 130 BPM or lower
    ]
}

Important Rules:
1. Always use string format for global events (g)
2. Keep notes between 49-75 for gentle sound
3. Use velocity 50 consistently
4. Use note durations that are multiples of 384
5. Include overlapping notes using negative delta_times
6. Maintain a consistent, calm pattern similar to the example
7. Never leave silent gaps - notes should connect smoothly
8. Use longer durations (768, 1152, 1920) for a calming effect'''

    # save in file the prompt 
    with open("prompt.txt", "w") as file:
        file.write(f"{MIDI_PROMPT}\n{example_section}")

    return f"{MIDI_PROMPT}\n{example_section}"




def create_agent(example_path: str = None) -> Agent:
    """Create the Gemini agent with MIDI context and optional example"""
    midi_context = get_midi_context(example_path)
    return Agent(
        'gemini-2.0-flash-thinking-exp-1219',
        result_type=MidiStructure,
        system_prompt=(
            f"\n\n"
            "You are a MIDI generation assistant. Always return complete, valid MIDI JSON data "
            "following the exact structure specified above. Your response must be parseable "
            "as a valid MIDI structure. avoid silences, notes must be continue\n IMPORTANT EXAMPLE:{midi_context}"
        ),
        model_settings=ModelSettings(
            max_tokens=8000,  # Ensure enough tokens for complex MIDI structures
        )
    )

def run_agent_sync(prompt: str, example_path: str = None) -> MidiStructure:
    """Run the agent synchronously and return MIDI structure"""
    agent = create_agent(example_path)
    result = agent.run_sync(prompt)
    return result.data


def process_global_events(g_events: List[List[str]]):
    """Convert global events from strings to appropriate types"""
    processed = []
    for event in g_events:
        processed_event = []
        for value in event:
            try:
                # Try to convert to int if it's a number
                processed_event.append(int(value))
            except ValueError:
                # Keep as string if it can't be converted (like 's' or 't')
                processed_event.append(value)
        processed.append(processed_event)
    return processed




# In your main code:
if __name__ == "__main__":
    example_json_path = "output.json"
    
    response = run_agent_sync(
     f"[!important] Generate a calm song for myself of 50 BPM, just return the json of the provided example",
        example_json_path
    )
    
    # Convert to dict for processing
    midi_data = response.model_dump()
    
    # Process global events - convert numbers to actual integers
    processed_g = []
    for event in midi_data['g']:
        processed_event = []
        for i, value in enumerate(event):
            if i == 0:  # First element is event type ('s' or 't')
                processed_event.append(value)
            else:  # Convert remaining elements to integers
                try:
                    processed_event.append(int(value))
                except ValueError:
                    # Handle any potential conversion errors
                    print(f"Warning: Could not convert value {value} to integer")
                    processed_event.append(0)  # fallback value
        processed_g.append(processed_event)
    
    midi_data['g'] = processed_g
    
    # Convert back to JSON
    processed_result = json.dumps(midi_data, indent=2)
    print(processed_result)
    
    # Save and convert
    with open("output2.json", "w") as f:
        f.write(processed_result)
    
    text_to_midi(processed_result, "output.mid")