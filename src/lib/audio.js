// Simple sample-based player. Each pitch-class is a single .wav file in
// public/audio. We decode once into AudioBuffers and trigger them per keypress
// so overlapping notes can sustain naturally.

const FILE_FOR_PC = {
  0: 'c.wav',
  1: 'cs.wav',
  2: 'd.wav',
  3: 'ds.wav',
  4: 'e.wav',
  5: 'f.wav',
  6: 'fs.wav',
  7: 'g.wav',
  8: 'gs.wav',
  9: 'a.wav',
  10: 'as.wav',
  11: 'b.wav',
};

let ctx = null;
const buffers = new Map();
const loading = new Map();

const ensureContext = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
};

const loadBuffer = async (pc) => {
  const c = ensureContext();
  if (!c) return null;
  if (buffers.has(pc)) return buffers.get(pc);
  if (loading.has(pc)) return loading.get(pc);

  const file = FILE_FOR_PC[pc];
  if (!file) return null;
  const p = fetch(`${import.meta.env.BASE_URL}audio/${file}`)
    .then((r) => r.arrayBuffer())
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      buffers.set(pc, buf);
      return buf;
    })
    .catch(() => null);
  loading.set(pc, p);
  return p;
};

export const prewarmAudio = () => {
  // Resume context on user gesture (Chrome autoplay policy) and preload buffers.
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  Object.keys(FILE_FOR_PC).forEach((pc) => loadBuffer(Number(pc)));
};

export const playNote = async (pc, { octaveShift = 0, gain = 0.8 } = {}) => {
  const c = ensureContext();
  if (!c) return;
  const buf = await loadBuffer(pc);
  if (!buf) return;

  const source = c.createBufferSource();
  source.buffer = buf;
  // Shift octave by detuning ±1200 cents per octave.
  source.detune.value = octaveShift * 1200;

  const g = c.createGain();
  g.gain.value = gain;
  // Short release so rapid presses don't click.
  const now = c.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.linearRampToValueAtTime(0, now + Math.min(buf.duration, 1.2));

  source.connect(g);
  g.connect(c.destination);
  source.start(now);
  source.stop(now + Math.min(buf.duration, 1.2));
};
