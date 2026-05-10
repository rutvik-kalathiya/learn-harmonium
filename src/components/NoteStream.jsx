import { noteName } from '../lib/notation.js';

export default function NoteStream({ notes, index, history, notation, active }) {
  return (
    <div
      className={
        'relative mx-6 my-2 px-6 py-10 rounded-2xl bg-ink-900/60 border border-ink-700/50 ' +
        (active ? '' : 'blur-[2px]')
      }
    >
      <div className="note-stream text-2xl md:text-3xl leading-loose text-center select-none">
        {notes.map((pc, i) => {
          let cls = 'glyph upcoming';
          if (i < index) {
            cls = history[i] ? 'glyph correct' : 'glyph incorrect';
          } else if (i === index) {
            cls = 'glyph current';
          }
          return (
            <span key={i} className={cls}>
              {noteName(pc, notation)}
            </span>
          );
        })}
      </div>

      {!active && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="px-4 py-2 rounded-lg bg-ink-800/90 border border-ink-700 text-slate-300 text-sm shadow-xl">
            Click or press <kbd className="px-1.5 py-0.5 mx-1 bg-ink-700 rounded text-xs font-mono">Enter</kbd> to activate…
          </div>
        </div>
      )}
    </div>
  );
}
