import { NOTATIONS } from '../lib/notation.js';

export default function Header({ notation, onNotationChange }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-ink-700/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-warm-500 grid place-items-center text-ink-950 font-bold text-lg shadow-lg shadow-accent-600/20">
          ♪
        </div>
        <div className="leading-tight">
          <div className="text-slate-100 font-semibold">Learn Harmonium</div>
          <div className="text-xs text-slate-500">Play. Practice. Progress.</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 mr-2">Notation</span>
        <div className="inline-flex bg-ink-800 border border-ink-700 rounded-lg p-0.5">
          {Object.values(NOTATIONS).map((n) => {
            const active = n.id === notation;
            return (
              <button
                key={n.id}
                onClick={() => onNotationChange(n.id)}
                className={
                  'px-3 py-1.5 text-sm rounded-md transition ' +
                  (active
                    ? 'bg-accent-600 text-ink-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200')
                }
              >
                {n.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
