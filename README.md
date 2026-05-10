# Learn Harmonium

A focused, modern web app for learning the harmonium one key at a time. Inspired by typing tutors like keybr.com — the screen guides you to the next note, you play it, and new keys unlock as your accuracy improves.

## Stack

- Vite + React 19
- Tailwind CSS v3
- Web Audio API for sample playback

## Features

- **Guided practice** — each session focuses on one *current key* while mixing in keys you've already learned. Hit 90% accuracy and the next key unlocks.
- **Two notations** — switch between **English** (`C C# D … B`) and **German** (`C Cis D … H`) at any time.
- **Live keyboard** — an SVG harmonium shows the target key in gold and the keys you're pressing in blue, with the matching computer-keyboard binding printed on each key.
- **Real harmonium samples** — middle-octave `.wav` files in `public/audio` are loaded into AudioBuffers and triggered on each keypress, with octave shifts handled by detuning.
- **No login, no setup** — open it and play.

## Running

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>. Press `Enter` (or click) to activate the lesson.

## Keyboard mapping (1 octave)

White keys play `A S D F G H J` → C D E F G A B
Black keys play `W E T Y U` → C# D# F# G# A#

## Project layout

```
src/
  App.jsx                  ← state, scoring, key event wiring
  components/
    Header.jsx             ← notation toggle
    StatusBar.jsx          ← speed, accuracy, score, daily goal
    KeyRow.jsx             ← unlocked/current key strip
    NoteStream.jsx         ← flowing sequence of notes to play
    HarmoniumKeyboard.jsx  ← SVG keyboard, target + active highlighting
  lib/
    notation.js            ← pitch-class ↔ name, PC keyboard map
    lessons.js             ← lesson generator, unlock order
    audio.js               ← Web Audio sample player
public/
  audio/                   ← 12 .wav samples (one octave)
```

## License

MIT
