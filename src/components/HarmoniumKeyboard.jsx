import { noteName, KEY_FOR_PC, WHITE_PCS, BLACK_PCS } from '../lib/notation.js';

// Geometry (single octave). The component repeats the octave horizontally.
const WHITE_W = 56;
const WHITE_H = 220;
const BLACK_W = 34;
const BLACK_H = 138;

// Pitch class → index among the 7 white keys (or null for black keys)
const WHITE_INDEX = WHITE_PCS.reduce((acc, pc, i) => ({ ...acc, [pc]: i }), {});

// X offset of each black key within an octave, measured from the start of the octave.
// Black keys sit between two white keys.
const BLACK_X = {
  1: WHITE_W * 1 - BLACK_W / 2,   // C#  between C(0) and D(1)
  3: WHITE_W * 2 - BLACK_W / 2,   // D#
  6: WHITE_W * 4 - BLACK_W / 2,   // F#
  8: WHITE_W * 5 - BLACK_W / 2,   // G#
  10: WHITE_W * 6 - BLACK_W / 2,  // A#
};

export default function HarmoniumKeyboard({
  octaves = 2,
  targetPc = null,
  activePcs = new Set(),
  notation = 'english',
  onPress = null,
}) {
  const octaveW = WHITE_W * 7;
  const width = octaveW * octaves;
  const height = WHITE_H + 16;

  const whites = [];
  const blacks = [];

  for (let o = 0; o < octaves; o += 1) {
    WHITE_PCS.forEach((pc) => {
      const x = o * octaveW + WHITE_INDEX[pc] * WHITE_W;
      whites.push({ pc, x, octave: o });
    });
    BLACK_PCS.forEach((pc) => {
      const x = o * octaveW + BLACK_X[pc];
      blacks.push({ pc, x, octave: o });
    });
  }

  const isTarget = (pc, octave) => targetPc === pc && octave === 0;
  const isActive = (pc) => activePcs.has(pc);

  return (
    <div className="w-full overflow-x-auto px-6 pb-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[920px] mx-auto block"
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.35))' }}
      >
        <rect x="0" y="0" width={width} height="6" fill="#7c2d12" />
        <rect x="0" y={WHITE_H + 8} width={width} height="8" fill="#7c2d12" />

        {whites.map(({ pc, x, octave }, i) => {
          const target = isTarget(pc, octave);
          const active = isActive(pc);
          const pcKey = KEY_FOR_PC[pc];
          return (
            <g key={`w-${i}`} onMouseDown={() => onPress?.(pc, octave)} style={{ cursor: onPress ? 'pointer' : 'default' }}>
              <rect
                x={x + 1}
                y={8}
                width={WHITE_W - 2}
                height={WHITE_H}
                rx="3"
                className={
                  'harm-key white' +
                  (target ? ' target' : '') +
                  (active ? ' active' : '')
                }
              />
              <text
                x={x + WHITE_W / 2}
                y={WHITE_H - 6}
                className={'key-label ' + (target ? 'target' : 'on-white')}
              >
                {noteName(pc, notation)}
              </text>
              {octave === 0 && pcKey && (
                <text
                  x={x + WHITE_W / 2}
                  y={WHITE_H - 18}
                  className={'key-label ' + (target ? 'target' : 'on-white')}
                  style={{ fontSize: 9 }}
                >
                  {pcKey.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}

        {blacks.map(({ pc, x, octave }, i) => {
          const target = isTarget(pc, octave);
          const active = isActive(pc);
          const pcKey = KEY_FOR_PC[pc];
          return (
            <g key={`b-${i}`} onMouseDown={() => onPress?.(pc, octave)} style={{ cursor: onPress ? 'pointer' : 'default' }}>
              <rect
                x={x}
                y={8}
                width={BLACK_W}
                height={BLACK_H}
                rx="3"
                className={
                  'harm-key black' +
                  (target ? ' target' : '') +
                  (active ? ' active' : '')
                }
              />
              <text
                x={x + BLACK_W / 2}
                y={BLACK_H - 4}
                className={'key-label ' + (target ? 'target' : 'on-black')}
              >
                {noteName(pc, notation)}
              </text>
              {octave === 0 && pcKey && (
                <text
                  x={x + BLACK_W / 2}
                  y={BLACK_H - 16}
                  className={'key-label ' + (target ? 'target' : 'on-black')}
                  style={{ fontSize: 8 }}
                >
                  {pcKey.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
