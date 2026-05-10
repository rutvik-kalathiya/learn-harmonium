import { noteName, isBlackKey, PITCH_CLASSES } from '../lib/notation.js';

export default function KeyRow({ unlocked, currentKey, notation }) {
  return (
    <div className="flex flex-col gap-2 px-6 py-4">
      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 text-sm">
        <span className="text-slate-500">All keys:</span>
        <div className="flex flex-wrap gap-1.5">
          {PITCH_CLASSES.map((pc) => {
            const isUnlocked = unlocked.includes(pc);
            const isCurrent = pc === currentKey;
            const black = isBlackKey(pc);
            return (
              <div
                key={pc}
                className={
                  'min-w-[2.25rem] px-2 py-1 text-center rounded-md font-mono text-sm border ' +
                  (isCurrent
                    ? 'bg-accent-600 text-ink-950 border-accent-500 shadow-lg shadow-accent-600/40'
                    : isUnlocked
                      ? black
                        ? 'bg-ink-700 text-slate-300 border-ink-600'
                        : 'bg-ink-800 text-slate-200 border-ink-700'
                      : 'bg-ink-900/50 text-slate-600 border-ink-800')
                }
                title={isUnlocked ? 'Unlocked' : 'Locked — earn it by accuracy'}
              >
                {noteName(pc, notation)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[7rem_1fr] items-center gap-3 text-sm">
        <span className="text-slate-500">Current key:</span>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-md font-mono bg-accent-600 text-ink-950 font-semibold">
            {noteName(currentKey, notation)}
          </span>
          <span className="text-slate-500 text-xs">
            Building muscle memory — focus on hitting this one cleanly.
          </span>
        </div>
      </div>
    </div>
  );
}
