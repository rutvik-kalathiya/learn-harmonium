import { useState } from 'react';
import { noteName } from '../lib/notation.js';
import {
  PRESETS,
  loadCustomScripts,
  saveCustomScripts,
  parsePattern,
} from '../lib/library.js';

export default function Library({ notation, onPractice }) {
  const [customScripts, setCustomScripts] = useState(() => loadCustomScripts());
  const [newName, setNewName] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const pattern = parsePattern(newPattern);
    if (!name) {
      setError('Please enter a name.');
      return;
    }
    if (pattern.length === 0) {
      setError('Could not parse any notes. Try "C D E F G" or "Sa Re Ga Ma".');
      return;
    }
    const script = {
      id: `custom-${Date.now()}`,
      name,
      pattern,
      isCustom: true,
    };
    const updated = [...customScripts, script];
    setCustomScripts(updated);
    saveCustomScripts(updated);
    setNewName('');
    setNewPattern('');
    setError('');
  };

  const handleDelete = (id) => {
    const updated = customScripts.filter((s) => s.id !== id);
    setCustomScripts(updated);
    saveCustomScripts(updated);
  };

  const renderCard = (script) => (
    <div
      key={script.id}
      className="rounded-xl bg-ink-900/60 border border-ink-700/50 p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-slate-100 font-semibold">{script.name}</div>
        {script.isCustom && (
          <span className="text-[10px] uppercase tracking-wider text-accent-400 px-1.5 py-0.5 rounded bg-accent-600/10 border border-accent-600/30">
            Custom
          </span>
        )}
      </div>
      <div className="text-slate-400 text-sm leading-relaxed font-mono break-words">
        {script.pattern.map((pc) => noteName(pc, notation)).join(' · ')}
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <button
          onClick={() => onPractice(script)}
          className="px-3 py-1.5 rounded-md bg-warm-500 text-ink-950 font-semibold text-sm hover:bg-warm-400 transition"
        >
          Practice
        </button>
        {script.isCustom && (
          <button
            onClick={() => handleDelete(script.id)}
            className="px-2 py-1.5 rounded-md text-slate-400 hover:text-rose-300 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 px-6 py-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <section className="rounded-2xl bg-ink-900/40 border border-ink-700/40 p-5">
          <h2 className="text-slate-100 font-semibold mb-1">Add a custom song</h2>
          <p className="text-slate-500 text-sm mb-4">
            Type a name and a sequence of notes — e.g. <code className="text-slate-300">C D E F G</code>,{' '}
            <code className="text-slate-300">Sa Re Ga Ma Pa</code>, or with sharps{' '}
            <code className="text-slate-300">C C# D D#</code>.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Song name"
              className="md:w-64 px-3 py-2 rounded-md bg-ink-800 border border-ink-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-500"
            />
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder="Notes (e.g. C D E F G A B)"
              className="flex-1 px-3 py-2 rounded-md bg-ink-800 border border-ink-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-500 font-mono"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-md bg-accent-600 text-ink-950 font-semibold hover:bg-accent-500 transition"
            >
              Save
            </button>
          </div>
          {error && (
            <div className="mt-3 text-rose-400 text-sm">{error}</div>
          )}
        </section>

        {customScripts.length > 0 && (
          <section>
            <h3 className="text-slate-300 font-semibold mb-3">Your songs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customScripts.map(renderCard)}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-slate-300 font-semibold mb-3">Built-in library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map(renderCard)}
          </div>
        </section>
      </div>
    </div>
  );
}
