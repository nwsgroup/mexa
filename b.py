from midiutil import MIDIFile

# MIDI Setup
midi = MIDIFile(5)  # 5 tracks (Piano, Strings, Bass, Drums, Flute)
tempo = 100
midi.addTempo(0, 0, tempo)

# Track Assignments
PIANO, STRINGS, BASS, DRUMS, FLUTE = 0, 1, 2, 3, 4
CHANNEL = 0
VOLUME = 100

# Chord Progressions (Cmaj -> Am -> Fmaj -> Gmaj)
chords = [
    [60, 64, 67],  # C major
    [57, 60, 64],  # A minor
    [53, 57, 60],  # F major
    [55, 59, 62],  # G major
]

# Melody (Flute Lead)
melody_notes = [72, 74, 76, 77, 79, 81, 83, 84]  # Flowing melodic sequence
melody_times = [0, 1, 2, 3, 5, 6, 7, 8]  # Timing in beats

# Adding Chords to Strings
chord_time = 0
for chord in chords * 2:  # Repeat progression twice
    for note in chord:
        midi.addNote(STRINGS, CHANNEL, note, chord_time, 2, VOLUME - 20)
    chord_time += 2

# Adding Melody to Flute
for i, note in enumerate(melody_notes):
    midi.addNote(FLUTE, CHANNEL, note, melody_times[i], 1, VOLUME)

# Bassline (Root Notes)
bassline = [36, 33, 29, 31]  # Bass root notes matching chords
for i, note in enumerate(bassline * 2):
    midi.addNote(BASS, CHANNEL, note, i * 2, 2, VOLUME)

# Percussion (Basic Kick & Snare)
for beat in range(0, 16, 2):
    midi.addNote(DRUMS, CHANNEL, 35, beat, 1, VOLUME)  # Kick drum
    if beat % 4 == 2:
        midi.addNote(DRUMS, CHANNEL, 38, beat, 1, VOLUME)  # Snare

# Save MIDI File
midi_path = "armonic-composition.mid"
with open(midi_path, "wb") as output_file:
    midi.writeFile(output_file)

midi_path
