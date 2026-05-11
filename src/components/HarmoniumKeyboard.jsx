import {
  PC_KEY_FOR_MIDI,
  KEYBOARD_MIDI_LOW,
  KEYBOARD_MIDI_HIGH,
  isBlackMidi,
  midiToPc,
  noteName,
} from '../lib/notation.js';

const WHITE_W = 56;
const WHITE_H = 220;
const BLACK_W = 34;
const BLACK_H = 138;

// Build the static layout once at import time. For each MIDI note in range,
// figure out whether it's a white or black key and compute its x offset.
const buildLayout = () => {
  const whites = [];
  const blacks = [];
  let whiteIndex = 0;
  for (let midi = KEYBOARD_MIDI_LOW; midi <= KEYBOARD_MIDI_HIGH; midi += 1) {
    if (isBlackMidi(midi)) {
      // Black keys sit between two adjacent white keys. After whiteIndex - 1
      // increments, the next white key would render at whiteIndex * WHITE_W;
      // place the black key centered there.
      blacks.push({ midi, x: whiteIndex * WHITE_W - BLACK_W / 2 });
    } else {
      whites.push({ midi, x: whiteIndex * WHITE_W });
      whiteIndex += 1;
    }
  }
  return { whites, blacks, whiteCount: whiteIndex };
};

const LAYOUT = buildLayout();

export default function HarmoniumKeyboard({
  targetMidi = null,
  targetPc = null,
  activeMidis = new Set(),
  notation = 'english',
  onPress = null,
}) {
  const width = LAYOUT.whiteCount * WHITE_W;
  const height = WHITE_H + 16;

  return (
    <div className="w-full overflow-x-auto px-6 pb-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[1000px] mx-auto block"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.35))' }}
      >
        <rect x="0" y="0" width={width} height="6" fill="#7c2d12" />
        <rect x="0" y={WHITE_H + 8} width={width} height="8" fill="#7c2d12" />

        {LAYOUT.whites.map(({ midi, x }) => {
          const pc = midiToPc(midi);
          const target = targetMidi != null && midi === targetMidi;
          const sameClass =
            !target && targetPc != null && pc === targetPc;
          const active = activeMidis.has(midi);
          const pcKey = PC_KEY_FOR_MIDI[midi];
          return (
            <g
              key={`w-${midi}`}
              onMouseDown={() => onPress?.(midi)}
              style={{ cursor: onPress ? 'pointer' : 'default' }}
            >
              <rect
                x={x + 1}
                y={8}
                width={WHITE_W - 2}
                height={WHITE_H}
                rx="3"
                className={
                  'harm-key white' +
                  (target ? ' target' : '') +
                  (active ? ' active' : '') +
                  (sameClass ? ' hint' : '')
                }
              />
              <text
                x={x + WHITE_W / 2}
                y={WHITE_H - 6}
                className={'key-label ' + (target ? 'target' : 'on-white')}
              >
                {noteName(pc, notation)}
              </text>
              {pcKey && (
                <text
                  x={x + WHITE_W / 2}
                  y={WHITE_H - 18}
                  className={'key-label ' + (target ? 'target' : 'on-white')}
                  style={{ fontSize: 9 }}
                >
                  {pcKey}
                </text>
              )}
            </g>
          );
        })}

        {LAYOUT.blacks.map(({ midi, x }) => {
          const pc = midiToPc(midi);
          const target = targetMidi != null && midi === targetMidi;
          const sameClass =
            !target && targetPc != null && pc === targetPc;
          const active = activeMidis.has(midi);
          const pcKey = PC_KEY_FOR_MIDI[midi];
          return (
            <g
              key={`b-${midi}`}
              onMouseDown={() => onPress?.(midi)}
              style={{ cursor: onPress ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={8}
                width={BLACK_W}
                height={BLACK_H}
                rx="3"
                className={
                  'harm-key black' +
                  (target ? ' target' : '') +
                  (active ? ' active' : '') +
                  (sameClass ? ' hint' : '')
                }
              />
              <text
                x={x + BLACK_W / 2}
                y={BLACK_H - 4}
                className={'key-label ' + (target ? 'target' : 'on-black')}
              >
                {noteName(pc, notation)}
              </text>
              {pcKey && (
                <text
                  x={x + BLACK_W / 2}
                  y={BLACK_H - 16}
                  className={'key-label ' + (target ? 'target' : 'on-black')}
                  style={{ fontSize: 8 }}
                >
                  {pcKey}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
