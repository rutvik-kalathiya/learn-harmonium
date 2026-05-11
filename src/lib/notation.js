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

// PC keyboard → absolute MIDI note. Keyed by `KeyboardEvent.code`, which
// gives the physical key position regardless of OS keyboard layout. That
// way the same hardware keys work whether you're on a US/QWERTY or a
// German/QWERTZ keyboard — only the printed keycap differs.
//   G3=55 … F5=77, spanning 14 white keys and 9 black keys.
export const PC_KEY_MAP = {
  Backquote:    55, // G3   (US: `   DE: ^)
  IntlBackslash: 55, // G3   alternative code on some German keyboards
  Digit1:       56, // G#3
  KeyQ:         57, // A3
  Digit2:       58, // A#3
  KeyW:         59, // B3
  KeyE:         60, // C4   middle C
  Digit4:       61, // C#4
  KeyR:         62, // D4
  Digit5:       63, // D#4
  KeyT:         64, // E4
  KeyY:         65, // F4   (US: Y  DE: Z — QWERTZ)
  Digit7:       66, // F#4
  KeyU:         67, // G4
  Digit8:       68, // G#4
  KeyI:         69, // A4
  Digit9:       70, // A#4
  KeyO:         71, // B4
  KeyP:         72, // C5
  Minus:        73, // C#5  (US: -   DE: ß)
  BracketLeft:  74, // D5   (US: [   DE: ü)
  Equal:        75, // D#5  (US: =   DE: ´)
  BracketRight: 76, // E5   (US: ]   DE: +)
  Backslash:    77, // F5   (US: \\  DE: #)
};

// MIDI → KeyboardEvent.code (for matching geometry to a binding).
export const CODE_FOR_MIDI = Object.entries(PC_KEY_MAP).reduce(
  (acc, [code, midi]) => {
    acc[midi] = code;
    return acc;
  },
  {}
);

// What to print on each key, depending on the physical layout.
// (Matches the notation toggle — German notation users overwhelmingly use a
// German keyboard.)
export const KEYCAP_LABELS = {
  english: {
    Backquote: '`',
    IntlBackslash: '`',
    Digit1: '1',
    Digit2: '2',
    Digit4: '4',
    Digit5: '5',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    KeyQ: 'Q',
    KeyW: 'W',
    KeyE: 'E',
    KeyR: 'R',
    KeyT: 'T',
    KeyY: 'Y',
    KeyU: 'U',
    KeyI: 'I',
    KeyO: 'O',
    KeyP: 'P',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
  },
  german: {
    Backquote: '^',
    IntlBackslash: '^',
    Digit1: '1',
    Digit2: '2',
    Digit4: '4',
    Digit5: '5',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    KeyQ: 'Q',
    KeyW: 'W',
    KeyE: 'E',
    KeyR: 'R',
    KeyT: 'T',
    KeyY: 'Z', // QWERTZ
    KeyU: 'U',
    KeyI: 'I',
    KeyO: 'O',
    KeyP: 'P',
    Minus: 'ß',
    Equal: '´',
    BracketLeft: 'Ü',
    BracketRight: '+',
    Backslash: '#',
  },
};

export const keycapLabel = (midi, notationId) => {
  const code = CODE_FOR_MIDI[midi];
  if (!code) return null;
  const labels = KEYCAP_LABELS[notationId] ?? KEYCAP_LABELS.english;
  return labels[code] ?? code;
};

export const KEYBOARD_MIDI_LOW = 55;  // G3
export const KEYBOARD_MIDI_HIGH = 77; // F5

// Middle-C anchored target: when the lesson points at pitch class `pc`,
// we render the highlight on the central octave (C4..B4) so the eye knows
// exactly where to look.
export const targetMidiForPc = (pc) => 60 + pc;
