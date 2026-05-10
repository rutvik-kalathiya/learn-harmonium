import { PITCH_CLASSES } from './notation.js';

// Default unlock order — mirrors keybr's gradual key introduction.
// Start with E and A (matching the screenshot's "All keys: E N I A R L T O S U D Y..." idea)
// but for harmonium we lean on natural-key first, then introduce sharps.
export const DEFAULT_UNLOCK_ORDER = [4, 9, 0, 7, 2, 11, 5, 1, 3, 6, 8, 10];

export const initialProgress = () => ({
  // every key gets a confidence score 0..1; only the first two start unlocked
  unlocked: DEFAULT_UNLOCK_ORDER.slice(0, 2),
  currentKey: DEFAULT_UNLOCK_ORDER[0],
});

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate a "word-like" lesson by picking from unlocked keys, biased toward currentKey.
export const generateLesson = ({ unlocked, currentKey, length = 30 }) => {
  if (!unlocked || unlocked.length === 0) return [];
  const others = unlocked.filter((k) => k !== currentKey);
  const out = [];
  for (let i = 0; i < length; i += 1) {
    // 45% chance to pick the current key being learned, else random unlocked
    const pickCurrent = Math.random() < 0.45 && others.length > 0;
    out.push(pickCurrent ? currentKey : randItem(unlocked));
  }
  return out;
};

// Group the linear note list into short "words" of 3-6 notes for visual rhythm.
export const groupIntoWords = (notes) => {
  const words = [];
  let i = 0;
  while (i < notes.length) {
    const w = 3 + Math.floor(Math.random() * 4); // 3..6
    words.push(notes.slice(i, i + w));
    i += w;
  }
  return words;
};

// Sanity check exported for tests later
export const ALL_KEYS = PITCH_CLASSES;
