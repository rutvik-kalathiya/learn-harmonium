export default function StatusBar({ npm, accuracy, score, goalPct }) {
  return (
    <div className="px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-ink-700/40">
      <Stat label="Speed"    value={`${npm.toFixed(1)} npm`} hint="notes / min" />
      <Stat label="Accuracy" value={`${Math.round(accuracy * 100)}%`} hint="this session" />
      <Stat label="Score"    value={score.toString()} hint="from clean hits" />
      <Stat
        label="Daily goal"
        value={`${Math.round(goalPct * 100)}%`}
        hint="30 minutes of practice"
        bar={goalPct}
      />
    </div>
  );
}

function Stat({ label, value, hint, bar }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-slate-500 text-xs uppercase tracking-wider">{label}</div>
      <div className="text-slate-100 font-mono">{value}</div>
      {typeof bar === 'number' ? (
        <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-warm-500"
            style={{ width: `${Math.min(100, Math.max(0, bar * 100))}%` }}
          />
        </div>
      ) : (
        <div className="text-slate-600 text-xs">{hint}</div>
      )}
    </div>
  );
}
