// Semitone offset within an octave, 0 = C, 11 = B
// Each note keeps a canonical pitch-class (0-11). Display name is per-notation.

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
    // In German notation, English B = H, English A# / B♭ = B.
    names: ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'],
  },
};

export const PITCH_CLASSES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
export const BLACK_PCS = [1, 3, 6, 8, 10];

export const isBlackKey = (pc) => BLACK_PCS.includes(pc);

export const noteName = (pc, notationId) => {
  const n = NOTATIONS[notationId] ?? NOTATIONS.english;
  return n.names[pc];
};

// Computer keyboard → pitch-class mapping (single octave, piano-style).
// Lower row = white keys, upper row = black keys, like a typical PC piano.
export const PC_KEY_MAP = {
  // White keys: C D E F G A B
  a: 0,
  s: 2,
  d: 4,
  f: 5,
  g: 7,
  h: 9,
  j: 11,
  // Black keys: C# D# F# G# A#
  w: 1,
  e: 3,
  t: 6,
  y: 8,
  u: 10,
};

// Reverse lookup: pitch class → key on the PC keyboard
export const KEY_FOR_PC = Object.entries(PC_KEY_MAP).reduce((acc, [k, pc]) => {
  acc[pc] = k;
  return acc;
}, {});
