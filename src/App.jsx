import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import KeyRow from './components/KeyRow.jsx';
import StatusBar from './components/StatusBar.jsx';
import NoteStream from './components/NoteStream.jsx';
import HarmoniumKeyboard from './components/HarmoniumKeyboard.jsx';
import Controls from './components/Controls.jsx';
import Library from './components/Library.jsx';
import { PC_KEY_MAP, midiToPc, targetMidiForPc } from './lib/notation.js';
import {
  DEFAULT_UNLOCK_ORDER,
  generateLesson,
  initialProgress,
} from './lib/lessons.js';
import {
  noteOn,
  noteOff,
  allNotesOff,
  prewarmAudio,
  setMasterVolume,
  setReverbEnabled,
} from './lib/audio.js';

const ACCURACY_UNLOCK = 0.9;
const LESSON_LENGTH = 36;

export default function App() {
  const [notation, setNotation] = useState('english');
  const [mode, setMode] = useState('learn'); // 'learn' | 'play' | 'library'
  // When non-null, learn mode runs a fixed practice script instead of a
  // randomly generated lesson and never unlocks new keys.
  const [practiceScript, setPracticeScript] = useState(null);

  // Lesson state
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
  const [activeMidis, setActiveMidis] = useState(() => new Set());

  // Stats
  const [score, setScore] = useState(0);
  const [sessionHits, setSessionHits] = useState(0);
  const [sessionMisses, setSessionMisses] = useState(0);
  const startTimeRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Harmonium controls
  const [transpose, setTranspose] = useState(0);
  const [octave, setOctave] = useState(3);     // 3 = no shift (matches original)
  const [reeds, setReeds] = useState(0);
  const [volume, setVolume] = useState(0.55);
  const [reverb, setReverb] = useState(true);

  const octaveShift = octave - 3;

  // Push volume / reverb changes into the audio engine.
  useEffect(() => { setMasterVolume(volume); }, [volume]);
  useEffect(() => { setReverbEnabled(reverb); }, [reverb]);

  const accuracy = useMemo(() => {
    const total = sessionHits + sessionMisses;
    return total === 0 ? 1 : sessionHits / total;
  }, [sessionHits, sessionMisses]);

  const npm = useMemo(() => {
    if (!active || elapsedMs < 1500) return 0;
    return (sessionHits / elapsedMs) * 60_000;
  }, [active, sessionHits, elapsedMs]);

  const goalPct = Math.min(1, elapsedMs / (30 * 60_000));

  const currentTargetPc = index < notes.length ? notes[index] : null;
  const currentTargetMidi =
    currentTargetPc != null ? targetMidiForPc(currentTargetPc) : null;

  const reshuffle = useCallback((p, script = null) => {
    if (script) {
      setNotes([...script.pattern]);
    } else {
      setNotes(
        generateLesson({
          unlocked: p.unlocked,
          currentKey: p.currentKey,
          length: LESSON_LENGTH,
        })
      );
    }
    setIndex(0);
    setHistory([]);
  }, []);

  // End-of-lesson handoff. In practice mode just loop the script; otherwise
  // maybe unlock the next key and reshuffle a fresh random lesson.
  useEffect(() => {
    if (index < notes.length) return;
    const total = history.length;
    if (total === 0) return;

    if (practiceScript) {
      setNotes([...practiceScript.pattern]);
      setIndex(0);
      setHistory([]);
      return;
    }

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
  }, [index, notes.length, history, reshuffle, practiceScript]);

  useEffect(() => {
    if (!active) return;
    if (startTimeRef.current == null) startTimeRef.current = performance.now();
    const id = setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [active]);

  // Keep the latest config in a ref so the keydown handler doesn't need to
  // re-register on every slider tick.
  const cfgRef = useRef({ transpose, octaveShift, reeds });
  cfgRef.current = { transpose, octaveShift, reeds };
  const targetRef = useRef(currentTargetPc);
  targetRef.current = currentTargetPc;
  const activeRef = useRef(active);
  activeRef.current = active;
  const modeRef = useRef(mode);
  modeRef.current = mode;

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
        allNotesOff();
        setActive(false);
        return;
      }

      const midi = PC_KEY_MAP[e.code];
      if (midi == null) return;
      e.preventDefault();

      const { transpose: tr, octaveShift: oct, reeds: r } = cfgRef.current;
      noteOn(midi, { transpose: tr, octaveShift: oct, reeds: r });

      setActiveMidis((prev) => {
        const next = new Set(prev);
        next.add(midi);
        return next;
      });

      if (modeRef.current !== 'learn') return;
      if (!activeRef.current) return;
      const target = targetRef.current;
      if (target == null) return;
      const pressedPc = midiToPc(midi);
      const correct = pressedPc === target;
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
      const midi = PC_KEY_MAP[e.code];
      if (midi == null) return;
      const { transpose: tr, octaveShift: oct, reeds: r } = cfgRef.current;
      noteOff(midi, { transpose: tr, octaveShift: oct, reeds: r });
      setActiveMidis((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const resetStats = () => {
    setScore(0);
    setSessionHits(0);
    setSessionMisses(0);
    setElapsedMs(0);
    startTimeRef.current = null;
  };

  const onResetSession = () => {
    resetStats();
    reshuffle(progress, practiceScript);
  };

  const onModeChange = (next) => {
    if (next === mode) return;
    allNotesOff();
    setActiveMidis(new Set());
    if (next !== 'learn') setActive(false);
    // Explicit mode toggles exit practice — Library is the only way back in.
    if (practiceScript) {
      setPracticeScript(null);
      if (next === 'learn') reshuffle(progress);
    }
    setMode(next);
  };

  const onPractice = (script) => {
    allNotesOff();
    setActiveMidis(new Set());
    setPracticeScript(script);
    reshuffle(progress, script);
    resetStats();
    setMode('learn');
    setActive(false);
  };

  const onExitPractice = () => {
    setPracticeScript(null);
    reshuffle(progress);
    resetStats();
    setMode('library');
    allNotesOff();
    setActiveMidis(new Set());
    setActive(false);
  };

  const isLearn = mode === 'learn';
  const isLibrary = mode === 'library';

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        notation={notation}
        onNotationChange={setNotation}
        mode={mode}
        onModeChange={onModeChange}
      />

      <main className="flex-1 flex flex-col">
        {isLibrary && (
          <Library notation={notation} onPractice={onPractice} />
        )}

        {!isLibrary && isLearn && (
          <>
            <StatusBar
              npm={npm}
              accuracy={accuracy}
              score={score}
              goalPct={goalPct}
            />

            {practiceScript ? (
              <div className="mx-6 mt-2 px-4 py-2 rounded-lg bg-warm-500/10 border border-warm-500/40 flex items-center justify-between gap-3">
                <div className="text-sm text-warm-200">
                  <span className="text-warm-300 font-semibold">Practicing:</span>{' '}
                  {practiceScript.name}
                </div>
                <button
                  onClick={onExitPractice}
                  className="text-xs px-2 py-1 rounded-md bg-ink-800 border border-ink-700 text-slate-300 hover:border-ink-600"
                >
                  Back to Library
                </button>
              </div>
            ) : (
              <KeyRow
                unlocked={progress.unlocked}
                currentKey={progress.currentKey}
                notation={notation}
              />
            )}
          </>
        )}

        {!isLibrary && (
        <div
          className={
            'flex-1 flex flex-col justify-center ' +
            (isLearn ? 'cursor-text' : '')
          }
          onClick={isLearn ? () => { prewarmAudio(); setActive(true); } : undefined}
        >
          {isLearn ? (
            <NoteStream
              notes={notes}
              index={index}
              history={history}
              notation={notation}
              active={active}
            />
          ) : (
            <div className="text-center pt-6 pb-2 text-slate-500 text-sm">
              Free play — no lesson, no scoring. Use your keyboard, mouse, or
              the controls below.
            </div>
          )}

          <HarmoniumKeyboard
            targetMidi={isLearn ? currentTargetMidi : null}
            targetPc={isLearn ? currentTargetPc : null}
            activeMidis={activeMidis}
            notation={notation}
            onPress={(midi) => {
              prewarmAudio();
              const { transpose: tr, octaveShift: oct, reeds: r } = cfgRef.current;
              noteOn(midi, { transpose: tr, octaveShift: oct, reeds: r });
              setActiveMidis((prev) => {
                const next = new Set(prev);
                next.add(midi);
                return next;
              });
              if (modeRef.current !== 'learn') return;
              if (!activeRef.current) return;
              const target = targetRef.current;
              if (target == null) return;
              const pressedPc = midiToPc(midi);
              const correct = pressedPc === target;
              setHistory((h) => [...h, correct]);
              setIndex((i) => i + 1);
              if (correct) {
                setSessionHits((n) => n + 1);
                setScore((s) => s + 10);
              } else {
                setSessionMisses((n) => n + 1);
                setScore((s) => Math.max(0, s - 3));
              }
            }}
            onRelease={(midi) => {
              const { transpose: tr, octaveShift: oct, reeds: r } = cfgRef.current;
              noteOff(midi, { transpose: tr, octaveShift: oct, reeds: r });
              setActiveMidis((prev) => {
                if (!prev.has(midi)) return prev;
                const next = new Set(prev);
                next.delete(midi);
                return next;
              });
            }}
          />
        </div>
        )}

        {!isLibrary && (
        <Controls
          transpose={transpose}
          setTranspose={setTranspose}
          octave={octave}
          setOctave={setOctave}
          reeds={reeds}
          setReeds={setReeds}
          volume={volume}
          setVolume={setVolume}
          reverb={reverb}
          setReverb={setReverb}
          notation={notation}
        />
        )}

        {!isLibrary && (
        <footer className="flex items-center justify-between px-6 py-3 border-t border-ink-700/40 text-xs text-slate-500">
          <div>
            {isLearn
              ? 'Play the highlighted key with your computer keyboard — the binding is printed on each SVG key.'
              : 'Free play — every key is yours. Same bindings as Learning mode.'}
          </div>
          <div className="flex items-center gap-3">
            {isLearn && (
              <>
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
              </>
            )}
          </div>
        </footer>
        )}
      </main>
    </div>
  );
}
