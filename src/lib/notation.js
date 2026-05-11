// Pitch class = 0..11 (C..B). MIDI note = 0..127, MIDI 60 = C4 (middle C).
// Each lesson target is a pitch class; the keyboard renders absolute MIDI keys.

export const NOTATIONS = {
  english: {
    id: 'english',
    label: 'English',
    short: 'EN',
    names: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  },
  german: {
    id: 'german',
    label: 'German',
    short: 'DE',
    // German notation: English B = H, English A# / B♭ = B.
    names: ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'],
  },
};

export const PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
export const BLACK_PCS = [1, 3, 6, 8, 10];

export const isBlackKey = (pc) => BLACK_PCS.includes(pc);
export const midiToPc = (midi) => ((midi % 12) + 12) % 12;
export const midiToOctave = (midi) => Math.floor(midi / 12) - 1;
export const isBlackMidi = (midi) => isBlackKey(midiToPc(midi));

export const noteName = (pc, notationId) => {
  const n = NOTATIONS[notationId] ?? NOTATIONS.english;
  return n.names[pc];
};

// PC keyboard → absolute MIDI note. Mirrors the original webharmonium keymap
// so muscle memory carries over from the old project.
//   G3=55 … F5=77, spanning 14 white keys and 9 black keys.
export const PC_KEY_MAP = {
  '`': 55, // G3
  '1': 56, // G#3
  q: 57,   // A3
  '2': 58, // A#3
  w: 59,   // B3
  e: 60,   // C4  (middle C)
  '4': 61, // C#4
  r: 62,   // D4
  '5': 63, // D#4
  t: 64,   // E4
  y: 65,   // F4
  '7': 66, // F#4
  u: 67,   // G4
  '8': 68, // G#4
  i: 69,   // A4
  '9': 70, // A#4
  o: 71,   // B4
  p: 72,   // C5
  '-': 73, // C#5
  '[': 74, // D5
  '=': 75, // D#5
  ']': 76, // E5
  '\\': 77, // F5
};

// Reverse: MIDI → PC keyboard character (for labelling the SVG keys).
export const PC_KEY_FOR_MIDI = Object.entries(PC_KEY_MAP).reduce(
  (acc, [k, midi]) => {
    acc[midi] = k;
    return acc;
  },
  {}
);

// MIDI range covered by the rendered keyboard.
export const KEYBOARD_MIDI_LOW = 55;  // G3
export const KEYBOARD_MIDI_HIGH = 77; // F5

// Middle-C anchored target: when the lesson points at pitch class `pc`,
// we render the highlight on the central octave (C4..B4) so the eye knows
// exactly where to look.
export const targetMidiForPc = (pc) => 60 + pc; // C4 + pc semitones
