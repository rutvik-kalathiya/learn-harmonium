const GITHUB_URL = 'https://github.com/rutvik-kalathiya/learn-harmonium';

export default function Footer({ isLibrary, isLearn, onResetSession }) {
  return (
    <footer className="mt-auto flex-shrink-0 border-t border-ink-700/40 bg-ink-950/60">
      <div className="px-6 py-5 space-y-4">
        {!isLibrary && (
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:justify-center">
            <div className="leading-relaxed">
              {isLearn
                ? 'Play the highlighted key with your computer keyboard — the binding is printed on each SVG key.'
                : 'Free play — every key is yours. Same bindings as Learning mode.'}
            </div>
            {isLearn && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onResetSession}
                  className="px-3 py-1.5 rounded-md bg-ink-800 border border-ink-700 hover:border-ink-600 text-slate-300"
                >
                  Reset session
                </button>
                <span className="text-slate-500">
                  <kbd className="px-1.5 py-0.5 mx-0.5 bg-ink-800 border border-ink-700 rounded text-xs">
                    Enter
                  </kbd>{' '}
                  start ·{' '}
                  <kbd className="px-1.5 py-0.5 mx-0.5 bg-ink-800 border border-ink-700 rounded text-xs">
                    Esc
                  </kbd>{' '}
                  pause
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={
            'mx-auto max-w-2xl space-y-2 text-center' +
            (!isLibrary ? ' border-t border-ink-800/70 pt-4' : '')
          }
        >
          <p className="text-sm text-slate-300 leading-relaxed">
            Free and open source — built for anyone who wants to learn harmonium,
            at their own pace.
          </p>
          <p className="text-xs text-slate-500">
            <span className="text-slate-400 font-medium">Rutvik Kalathiya</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-accent-300 underline-offset-2 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
