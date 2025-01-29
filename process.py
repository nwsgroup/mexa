from midiutil import MIDIFile
import mido
import json
from collections import defaultdict

def midi_to_text(midi_path, min_velocity=10):
    """Convert MIDI to ultra-compact text representation with duration handling."""
    mid = mido.MidiFile(midi_path)
    song = {'q': mid.ticks_per_beat, 't': []}
    global_events = []

    # Process first track for global events
    abs_time = 0
    for msg in mid.tracks[0]:
        abs_time += msg.time
        if msg.type == 'set_tempo':
            global_events.append(['t', abs_time, int(mido.tempo2bpm(msg.tempo))])
        elif msg.type == 'time_signature':
            global_events.append(['s', abs_time, msg.numerator, msg.denominator])
    
    if global_events:
        song['g'] = global_events

    # Process tracks
    for track in mid.tracks:
        notes = []
        active = defaultdict(list)
        abs_time = last = prog = 0
        
        for msg in track:
            abs_time += msg.time
            if msg.type == 'program_change':
                prog = msg.program
            elif msg.type in ('note_on', 'note_off') or (msg.type == 'note_on' and msg.velocity == 0):
                vel = msg.velocity
                if msg.type == 'note_off' or (msg.type == 'note_on' and vel < min_velocity):
                    # Find and close matching note
                    if active[msg.channel]:
                        note = next((n for n in reversed(active[msg.channel]) if n['note'] == msg.note), None)
                        if note:
                            active[msg.channel].remove(note)
                            delta = note['start'] - last
                            entry = [delta, msg.note, note['vel'], abs_time - note['start']]
                            if msg.channel: entry.append(msg.channel)
                            notes.append(entry)
                            last = note['start']
                elif msg.type == 'note_on':
                    # Record as potential note start
                    active[msg.channel].append({
                        'note': msg.note,
                        'start': abs_time,
                        'vel': vel
                    })

        # Add remaining active notes (handle hanging notes)
        for chan in active:
            for note in active[chan]:
                delta = note['start'] - last
                entry = [delta, note['note'], note['vel'], 0]  # 0 duration for hanging notes
                if chan: entry.append(chan)
                notes.append(entry)
                last = note['start']

        if notes:
            track_data = {'n': notes}
            if prog != 0:
                track_data['i'] = prog
            song['t'].append(track_data)

    return json.dumps(song, separators=(',', ':'))

def text_to_midi(text_repr, output_path):
    """Convert compact text representation back to MIDI."""
    if isinstance(text_repr, str):
        data = json.loads(text_repr)
    else:
        data = text_repr
    midi = MIDIFile(len(data['t']), data['q'])
    ppq = data['q']

    # Add global events
    if 'g' in data:
        for evt in data['g']:
            t = evt[1] / ppq
            if evt[0] == 't':
                midi.addTempo(0, t, evt[2])
            elif evt[0] == 's':
                midi.addTimeSignature(0, t, evt[2], evt[3], 24, 8)

    # Process tracks
    for tidx, track in enumerate(data['t']):
        if 'i' in track:
            midi.addProgramChange(tidx, 0, 0, track['i'])
        
        abs_time = 0
        for note in track['n']:
            abs_time += note[0]
            dur = note[3] / ppq
            midi.addNote(
                tidx,
                note[4] if len(note) > 4 else 0,
                note[1],
                abs_time / ppq,
                dur,
                note[2]
            )

    with open(output_path, 'wb') as f:
        midi.writeFile(f)

def process_midi_example(input_path, output_path):
    text_repr = midi_to_text(input_path)
    print(f"Compressed size: {len(text_repr)} chars")
    
    with open("output.json", "w") as f:
        f.write(text_repr)
    
    text_to_midi(text_repr, output_path)
    print(f"MIDI reconstructed to {output_path}")

if __name__ == "__main__":
    process_midi_example("calm.mid", "output.mid")