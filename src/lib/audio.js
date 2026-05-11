// Web Audio sample player for the harmonium.
// 12 single-octave samples live in public/audio (c.wav .. b.wav, with sharps).
// All other pitches are produced by detuning these samples.
//
// Pipeline:  sample -> noteGain -> (optional reverb send) -> masterGain -> destination
// Each call to playNote can layer extra octave-doubled voices ("additional reeds")
// for the fatter harmonium timbre.

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

// The samples were recorded around C4 (MIDI 60). Higher/lower MIDI notes are
// produced by detuning ±100 cents per semitone away from this base.
const SAMPLE_BASE_MIDI = 60;
const REVERB_FILE = 'reverb.wav';

let ctx = null;
let masterGain = null;
let reverbSend = null;       // gain into the convolver (controls wet level)
let reverbBus = null;        // convolver output -> destination
let convolver = null;
let reverbBuffer = null;
let reverbReady = false;
const buffers = new Map();
const loading = new Map();

const ensureContext = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(ctx.destination);

  convolver = ctx.createConvolver();
  reverbBus = ctx.createGain();
  reverbBus.gain.value = 0.45;
  convolver.connect(reverbBus);
  reverbBus.connect(ctx.destination);

  reverbSend = ctx.createGain();
  reverbSend.gain.value = 0; // off until user toggles reverb on
  reverbSend.connect(convolver);

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

const loadReverb = async () => {
  const c = ensureContext();
  if (!c || reverbReady) return;
  try {
    const ab = await fetch(`${import.meta.env.BASE_URL}audio/${REVERB_FILE}`).then(
      (r) => r.arrayBuffer()
    );
    const buf = await c.decodeAudioData(ab);
    reverbBuffer = buf;
    convolver.buffer = reverbBuffer;
    reverbReady = true;
  } catch {
    // best-effort — reverb is optional
  }
};

export const prewarmAudio = () => {
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  Object.keys(FILE_FOR_PC).forEach((pc) => loadBuffer(Number(pc)));
  loadReverb();
};

export const setMasterVolume = (v) => {
  const c = ensureContext();
  if (!c) return;
  masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), c.currentTime, 0.01);
};

export const setReverbEnabled = (on) => {
  const c = ensureContext();
  if (!c) return;
  if (on && !reverbReady) loadReverb();
  reverbSend.gain.setTargetAtTime(on ? 0.4 : 0, c.currentTime, 0.05);
};

// Trigger a single note from an absolute MIDI number, plus optional octave-
// shifted "reeds" layered on top. Returns nothing — fire-and-forget.
export const playNote = async (
  midi,
  { transpose = 0, octaveShift = 0, reeds = 0, gain = 0.85 } = {}
) => {
  const c = ensureContext();
  if (!c) return;

  const effectiveMidi = midi + transpose + octaveShift * 12;
  const pc = ((effectiveMidi % 12) + 12) % 12;
  const buf = await loadBuffer(pc);
  if (!buf) return;

  // Reed 0 = the fundamental; each extra reed is one octave up.
  const voices = [0];
  for (let i = 1; i <= reeds; i += 1) voices.push(i);

  const now = c.currentTime;
  voices.forEach((octave) => {
    const source = c.createBufferSource();
    source.buffer = buf;
    const detuneCents = (effectiveMidi - SAMPLE_BASE_MIDI + octave * 12) * 100;
    source.detune.value = detuneCents;

    const g = c.createGain();
    // Quieter for higher reeds so the layering feels natural.
    const voiceGain = gain * Math.pow(0.7, octave);
    g.gain.setValueAtTime(voiceGain, now);
    const release = Math.min(buf.duration, 1.4);
    g.gain.linearRampToValueAtTime(0, now + release);

    source.connect(g);
    g.connect(masterGain);
    g.connect(reverbSend);

    source.start(now);
    source.stop(now + release);
  });
};
