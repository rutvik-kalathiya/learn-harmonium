import { noteName } from '../lib/notation.js';

export default function Controls({
  transpose,
  setTranspose,
  octave,
  setOctave,
  reeds,
  setReeds,
  volume,
  setVolume,
  reverb,
  setReverb,
  notation,
}) {
  const transposePc = ((transpose % 12) + 12) % 12;

  return (
    <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      <Stepper
        label="Transpose"
        sublabel={noteName(transposePc, notation)}
        value={transpose}
        format={(v) => (v > 0 ? `+${v}` : `${v}`)}
        onChange={(v) => setTranspose(Math.max(-12, Math.min(12, v)))}
      />
      <Stepper
        label="Current Octave"
        value={octave}
        onChange={(v) => setOctave(Math.max(0, Math.min(6, v)))}
      />
      <Stepper
        label="Additional Reeds"
        value={reeds}
        onChange={(v) => setReeds(Math.max(0, Math.min(3, v)))}
      />

      <div className="rounded-xl bg-ink-800/60 border border-ink-700 overflow-hidden">
        <div className="px-3 py-2 bg-ink-700/70 text-slate-200 text-sm font-medium text-center flex items-center justify-center gap-2">
          <span>Volume</span>
          <span className="text-slate-400 font-mono text-xs">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div className="px-4 py-3">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full accent-accent-500"
          />
        </div>
      </div>

      <div className="rounded-xl bg-ink-800/60 border border-ink-700 overflow-hidden">
        <div className="px-3 py-2 bg-ink-700/70 text-slate-200 text-sm font-medium text-center">
          Reverb
        </div>
        <div className="px-4 py-3 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setReverb(!reverb)}
            className={
              'relative inline-flex h-7 w-12 items-center rounded-full transition ' +
              (reverb ? 'bg-accent-600' : 'bg-ink-700 border border-ink-600')
            }
            aria-pressed={reverb}
          >
            <span
              className={
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
                (reverb ? 'translate-x-6' : 'translate-x-1')
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ label, sublabel, value, onChange, format }) {
  const display = format ? format(value) : value;
  return (
    <div className="rounded-xl bg-ink-800/60 border border-ink-700 overflow-hidden">
      <div className="px-3 py-2 bg-ink-700/70 text-slate-200 text-sm font-medium text-center flex items-center justify-center gap-2">
        <span>{label}</span>
        {sublabel && (
          <span className="text-accent-400 font-mono text-xs">— {sublabel}</span>
        )}
      </div>
      <div className="px-3 py-3 flex items-center justify-between gap-3">
        <StepBtn onClick={() => onChange(value - 1)}>−</StepBtn>
        <div className="font-mono text-slate-100 text-base min-w-[2ch] text-center">
          {display}
        </div>
        <StepBtn onClick={() => onChange(value + 1)}>+</StepBtn>
      </div>
    </div>
  );
}

function StepBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-10 h-8 rounded-md bg-ink-700 border border-ink-600 hover:border-accent-500 hover:text-accent-400 text-slate-300 font-mono text-lg leading-none"
    >
      {children}
    </button>
  );
}
