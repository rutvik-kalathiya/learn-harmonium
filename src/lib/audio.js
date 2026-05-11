// Single-sample sustain-loop player — same architecture as the original
// webharmonium project. One `harmonium-kannan-orig.wav` recording is loaded
// once and detuned (per 100 cents) to play every pitch. Each press creates a
// fresh AudioBufferSourceNode (BufferSourceNodes can only be started once),
// loops it from 0.5 s for sustain, and releases on key-up with a short fade.
//
// Routing:
//   source.gain  ─▶  masterGain  ─▶  destination
//                                \─▶  reverbSend ─▶ convolver ─▶ destination
//
// The sample's natural pitch is D4 (MIDI 62) — pressing 'e' (which maps to
// MIDI 60 = C4) thus needs a -2 semitone detune.

const SAMPLE_URL = 'audio/harmonium-kannan-orig.wav';
const REVERB_URL = 'audio/reverb.wav';
const SAMPLE_BASE_MIDI = 62;     // D4 — matches webharmonium rootKey
const LOOP_START = 0.5;          // seconds into the sample
const RELEASE_SEC = 0.18;        // fade out on key-up

let ctx = null;
let masterGain = null;
let reverbSend = null;
let convolver = null;
let sampleBuffer = null;
let reverbBuffer = null;
let sampleLoading = null;
let reverbLoading = null;

// Active voices, keyed by an opaque voice id (the MIDI of the played note,
// optionally + 12 * reedIndex). Each entry has the BufferSource + its gain
// so noteOff can fade out cleanly.
const voices = new Map();

// After `await loadSample()`, block starting new voices (e.g. Library mode
// or other UI where PC key "noteOn" must not sound).
let pcInstrumentBlocked = false;
export const setPcInstrumentBlocked = (blocked) => {
  pcInstrumentBlocked = blocked;
};

const ensureContext = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(ctx.destination);

  convolver = ctx.createConvolver();
  convolver.connect(ctx.destination);

  reverbSend = ctx.createGain();
  reverbSend.gain.value = 0;
  reverbSend.connect(convolver);
  // Send the master signal in parallel into the reverb send.
  masterGain.connect(reverbSend);

  return ctx;
};

const loadSample = () => {
  const c = ensureContext();
  if (!c) return Promise.resolve(null);
  if (sampleBuffer) return Promise.resolve(sampleBuffer);
  if (sampleLoading) return sampleLoading;
  sampleLoading = fetch(`${import.meta.env.BASE_URL}${SAMPLE_URL}`)
    .then((r) => r.arrayBuffer())
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      sampleBuffer = buf;
      return buf;
    })
    .catch(() => null);
  return sampleLoading;
};

const loadReverb = () => {
  const c = ensureContext();
  if (!c) return Promise.resolve(null);
  if (reverbBuffer) return Promise.resolve(reverbBuffer);
  if (reverbLoading) return reverbLoading;
  reverbLoading = fetch(`${import.meta.env.BASE_URL}${REVERB_URL}`)
    .then((r) => r.arrayBuffer())
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      reverbBuffer = buf;
      convolver.buffer = buf;
      return buf;
    })
    .catch(() => null);
  return reverbLoading;
};

export const prewarmAudio = () => {
  const c = ensureContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  loadSample();
  loadReverb();
};

export const setMasterVolume = (v) => {
  const c = ensureContext();
  if (!c) return;
  masterGain.gain.setTargetAtTime(
    Math.max(0, Math.min(1, v)),
    c.currentTime,
    0.01
  );
};

export const setReverbEnabled = (on) => {
  const c = ensureContext();
  if (!c) return;
  if (on) loadReverb();
  reverbSend.gain.setTargetAtTime(on ? 0.4 : 0, c.currentTime, 0.05);
};

// Start sustained playback of a MIDI pitch. Safe to call before the sample
// has finished loading — it awaits load and then starts (perceptually
// instant once warm).
export const noteOn = async (
  midi,
  { transpose = 0, octaveShift = 0, reeds = 0 } = {}
) => {
  const c = ensureContext();
  if (!c) return;
  const buf = await loadSample();
  if (!buf) return;
  if (pcInstrumentBlocked) return;

  const baseMidi = midi + transpose + octaveShift * 12;
  const triggerVoice = (voiceMidi, reedIndex) => {
    const id = `${voiceMidi}-${reedIndex}`;
    if (voices.has(id)) return;

    const source = c.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.loopStart = LOOP_START;
    source.detune.value = (voiceMidi - SAMPLE_BASE_MIDI) * 100;

    const g = c.createGain();
    const voiceGain = Math.pow(0.7, reedIndex); // upper reeds slightly softer
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(voiceGain, c.currentTime + 0.012); // tiny attack

    source.connect(g);
    g.connect(masterGain);

    source.start(0);
    voices.set(id, { source, gain: g });
  };

  triggerVoice(baseMidi, 0);
  for (let r = 1; r <= reeds; r += 1) {
    triggerVoice(baseMidi + 12 * r, r);
  }
};

export const noteOff = (
  midi,
  { transpose = 0, octaveShift = 0, reeds = 0 } = {}
) => {
  const c = ensureContext();
  if (!c) return;
  const baseMidi = midi + transpose + octaveShift * 12;
  const release = (voiceMidi, reedIndex) => {
    const id = `${voiceMidi}-${reedIndex}`;
    const v = voices.get(id);
    if (!v) return;
    voices.delete(id);
    const now = c.currentTime;
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.linearRampToValueAtTime(0, now + RELEASE_SEC);
    v.source.stop(now + RELEASE_SEC + 0.01);
  };
  release(baseMidi, 0);
  for (let r = 1; r <= reeds; r += 1) {
    release(baseMidi + 12 * r, r);
  }
};

// Stop every active voice. Useful on Escape / pause / reset.
export const allNotesOff = () => {
  const c = ensureContext();
  if (!c) return;
  voices.forEach((v) => {
    const now = c.currentTime;
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(v.gain.gain.value, now);
    v.gain.gain.linearRampToValueAtTime(0, now + RELEASE_SEC);
    v.source.stop(now + RELEASE_SEC + 0.01);
  });
  voices.clear();
};
