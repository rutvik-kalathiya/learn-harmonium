// Pre-defined practice songs + custom user-saved scripts. Each script is a
// list of pitch classes (0..11). The lesson engine plays them in order and
// loops back to the start when the user finishes.

export const PRESETS = [
  {
    id: 'sa-re-ga-ma',
    name: 'Sa Re Ga Ma (Ascending & Descending)',
    pattern: [0, 2, 4, 5, 7, 9, 11, 0, 11, 9, 7, 5, 4, 2, 0],
  },
  {
    id: 'alankar-1',
    name: 'Alankar — Ascending Scale',
    pattern: [0, 2, 4, 5, 7, 9, 11, 0],
  },
  {
    id: 'alankar-2',
    name: 'Alankar — Descending Scale',
    pattern: [0, 11, 9, 7, 5, 4, 2, 0],
  },
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle Little Star',
    pattern: [0, 0, 7, 7, 9, 9, 7, 5, 5, 4, 4, 2, 2, 0],
  },
  {
    id: 'mary',
    name: 'Mary Had a Little Lamb',
    pattern: [4, 2, 0, 2, 4, 4, 4, 2, 2, 2, 4, 7, 7],
  },
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    pattern: [0, 0, 2, 0, 5, 4, 0, 0, 2, 0, 7, 5],
  },
  {
    id: 'jingle-bells',
    name: 'Jingle Bells (chorus)',
    pattern: [4, 4, 4, 4, 4, 4, 4, 7, 0, 2, 4],
  },
  {
    id: 'ode-to-joy',
    name: 'Ode to Joy',
    pattern: [4, 4, 5, 7, 7, 5, 4, 2, 0, 0, 2, 4, 4, 2, 2],
  },
];

const STORAGE_KEY = 'learn-harmonium-custom-scripts';

export const loadCustomScripts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomScripts = (scripts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
  } catch {
    // localStorage might be unavailable (private mode, quota); silently ignore.
  }
};

// Accept tokens like "C", "C#", "Db", "Cis" (German sharp), and basic Indian
// sargam ("Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni").
const NOTE_TO_PC = {
  C: 0, 'C#': 1, Db: 1, Cis: 1,
  D: 2, 'D#': 3, Eb: 3, Dis: 3,
  E: 4,
  F: 5, 'F#': 6, Gb: 6, Fis: 6,
  G: 7, 'G#': 8, Ab: 8, Gis: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11, H: 11,
  Sa: 0, Re: 2, Ga: 4, Ma: 5, Pa: 7, Dha: 9, Ni: 11,
};

export const parsePattern = (input) => {
  if (!input) return [];
  const tokens = input.replace(/,/g, ' ').trim().split(/\s+/).filter(Boolean);
  const result = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    const key = lower.charAt(0).toUpperCase() + lower.slice(1);
    const pc = NOTE_TO_PC[key] ?? NOTE_TO_PC[t.toUpperCase()];
    if (pc != null) result.push(pc);
  }
  return result;
};
