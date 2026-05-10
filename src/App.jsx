import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import KeyRow from './components/KeyRow.jsx';
import StatusBar from './components/StatusBar.jsx';
import NoteStream from './components/NoteStream.jsx';
import HarmoniumKeyboard from './components/HarmoniumKeyboard.jsx';
import { PC_KEY_MAP } from './lib/notation.js';
import {
  DEFAULT_UNLOCK_ORDER,
  generateLesson,
  initialProgress,
} from './lib/lessons.js';
import { playNote, prewarmAudio } from './lib/audio.js';

const ACCURACY_UNLOCK = 0.9;
const LESSON_LENGTH = 36;

export default function App() {
  const [notation, setNotation] = useState('english');

  const [progress, setProgress] = useState(initialProgress);
  const [active, setActive] = useState(false);
  const [notes, setNotes] = useState(() =>
    generateLesson({
      unlocked: progress.unlocked,
      currentKey: progress.currentKey,
      length: LESSON_LENGTH,
    })
  );
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [activePcs, setActivePcs] = useState(() => new Set());

  const [score, setScore] = useState(0);
  const [sessionHits, setSessionHits] = useState(0);
  const [sessionMisses, setSessionMisses] = useState(0);
  const startTimeRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const accuracy = useMemo(() => {
    const total = sessionHits + sessionMisses;
    return total === 0 ? 1 : sessionHits / total;
  }, [sessionHits, sessionMisses]);

  const npm = useMemo(() => {
    if (!active || elapsedMs < 1500) return 0;
    return (sessionHits / elapsedMs) * 60_000;
  }, [active, sessionHits, elapsedMs]);

  const goalPct = Math.min(1, elapsedMs / (30 * 60_000));

  const currentTarget = index < notes.length ? notes[index] : null;

  const reshuffle = useCallback((p) => {
    setNotes(
      generateLesson({
        unlocked: p.unlocked,
        currentKey: p.currentKey,
        length: LESSON_LENGTH,
      })
    );
    setIndex(0);
    setHistory([]);
  }, []);

  useEffect(() => {
    if (index < notes.length) return;
    const total = history.length;
    if (total === 0) return;
    const correct = history.filter(Boolean).length;
    const sessionAcc = correct / total;

    setProgress((p) => {
      let next = p;
      if (sessionAcc >= ACCURACY_UNLOCK) {
        const lockedQueue = DEFAULT_UNLOCK_ORDER.filter(
          (pc) => !p.unlocked.includes(pc)
        );
        if (lockedQueue.length > 0) {
          const newKey = lockedQueue[0];
          next = {
            unlocked: [...p.unlocked, newKey],
            currentKey: newKey,
          };
        }
      }
      reshuffle(next);
      return next;
    });
  }, [index, notes.length, history, reshuffle]);

  useEffect(() => {
    if (!active) return;
    if (startTimeRef.current == null) startTimeRef.current = performance.now();
    const id = setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        prewarmAudio();
        setActive(true);
        return;
      }
      if (e.key === 'Escape') {
        setActive(false);
        return;
      }

      if (!active) return;
      const k = e.key.toLowerCase();
      const pc = PC_KEY_MAP[k];
      if (pc == null) return;
      e.preventDefault();

      playNote(pc);
      setActivePcs((prev) => {
        const next = new Set(prev);
        next.add(pc);
        return next;
      });

      const target = currentTarget;
      if (target == null) return;
      const correct = pc === target;
      setHistory((h) => [...h, correct]);
      setIndex((i) => i + 1);
      if (correct) {
        setSessionHits((n) => n + 1);
        setScore((s) => s + 10);
      } else {
        setSessionMisses((n) => n + 1);
        setScore((s) => Math.max(0, s - 3));
      }
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      const pc = PC_KEY_MAP[k];
      if (pc == null) return;
      setActivePcs((prev) => {
        const next = new Set(prev);
        next.delete(pc);
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [active, currentTarget]);

  const onResetSession = () => {
    setScore(0);
    setSessionHits(0);
    setSessionMisses(0);
    setElapsedMs(0);
    startTimeRef.current = null;
    reshuffle(progress);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header notation={notation} onNotationChange={setNotation} />

      <main className="flex-1 flex flex-col">
        <StatusBar
          npm={npm}
          accuracy={accuracy}
          score={score}
          goalPct={goalPct}
        />

        <KeyRow
          unlocked={progress.unlocked}
          currentKey={progress.currentKey}
          notation={notation}
        />

        <div
          className="flex-1 flex flex-col justify-center cursor-text"
          onClick={() => {
            prewarmAudio();
            setActive(true);
          }}
        >
          <NoteStream
            notes={notes}
            index={index}
            history={history}
            notation={notation}
            active={active}
          />

          <HarmoniumKeyboard
            octaves={2}
            targetPc={currentTarget}
            activePcs={activePcs}
            notation={notation}
            onPress={(pc, octave) => {
              prewarmAudio();
              playNote(pc, { octaveShift: octave });
            }}
          />
        </div>

        <footer className="flex items-center justify-between px-6 py-3 border-t border-ink-700/40 text-xs text-slate-500">
          <div>
            Play the highlighted key with your computer keyboard — lower row hits white keys, upper row hits black keys.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onResetSession}
              className="px-3 py-1.5 rounded-md bg-ink-800 border border-ink-700 hover:border-ink-600 text-slate-300"
            >
              Reset session
            </button>
            <span>
              <kbd className="px-1.5 py-0.5 mx-0.5 bg-ink-800 border border-ink-700 rounded text-xs">Enter</kbd> start
              ·
              <kbd className="px-1.5 py-0.5 mx-0.5 bg-ink-800 border border-ink-700 rounded text-xs">Esc</kbd> pause
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
