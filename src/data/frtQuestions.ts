import type { Fig, Shape, Fill, Size, FRTQuestion } from './frtTypes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function f(shape: Shape, fill: Fill = 'solid', size: Size = 2, rotation = 0, count = 1): Fig {
  return { shape, fill, size, rotation, count };
}

// Place correct answer at position (id % 4) among distractors
function makeQ(
  id: number,
  cells8: Fig[],
  correct: Fig,
  d1: Fig,
  d2: Fig,
  d3: Fig,
  explanation: string,
  type: FRTQuestion['type'] = 'matrix3x3'
): FRTQuestion {
  const pos = id % 4;
  const opts: [Fig, Fig, Fig, Fig] = [d1, d2, d3, d1]; // placeholder
  const pool = [d1, d2, d3];
  let pi = 0;
  for (let i = 0; i < 4; i++) {
    if (i === pos) opts[i] = correct;
    else opts[i] = pool[pi++];
  }
  return { id, type, cells: cells8, options: opts, answer: pos, explanation };
}

// Build 3×3 matrix cells (first 8, 9th = answer)
function m(r0c0:Fig, r0c1:Fig, r0c2:Fig, r1c0:Fig, r1c1:Fig, r1c2:Fig, r2c0:Fig, r2c1:Fig): Fig[] {
  return [r0c0,r0c1,r0c2,r1c0,r1c1,r1c2,r2c0,r2c1];
}

// ─── All Shapes / Fills / Sizes / Rotations ───────────────────────────────────

const SHAPES: Shape[] = ['circle','square','triangle','diamond','pentagon','hexagon','star','cross'];
const FILLS: Fill[] = ['solid','empty','striped','dotted'];
const ROTS = [0, 45, 90, 135, 180, 225, 270, 315];

// Triplets of shapes for matrix rows/columns
const SHAPE_TRIPLES: [Shape,Shape,Shape][] = [
  ['circle','square','triangle'],
  ['circle','square','diamond'],
  ['circle','square','pentagon'],
  ['circle','square','hexagon'],
  ['circle','square','star'],
  ['circle','square','cross'],
  ['circle','triangle','diamond'],
  ['circle','triangle','pentagon'],
  ['circle','triangle','hexagon'],
  ['circle','triangle','star'],
  ['circle','triangle','cross'],
  ['circle','diamond','pentagon'],
  ['circle','diamond','hexagon'],
  ['circle','diamond','star'],
  ['circle','diamond','cross'],
  ['circle','pentagon','hexagon'],
  ['circle','pentagon','star'],
  ['circle','pentagon','cross'],
  ['circle','hexagon','star'],
  ['circle','hexagon','cross'],
  ['circle','star','cross'],
  ['square','triangle','diamond'],
  ['square','triangle','pentagon'],
  ['square','triangle','hexagon'],
  ['square','triangle','star'],
  ['square','triangle','cross'],
  ['square','diamond','pentagon'],
  ['square','diamond','hexagon'],
  ['square','diamond','star'],
  ['square','diamond','cross'],
  ['square','pentagon','hexagon'],
  ['square','pentagon','star'],
  ['square','pentagon','cross'],
  ['square','hexagon','star'],
  ['square','hexagon','cross'],
  ['square','star','cross'],
  ['triangle','diamond','pentagon'],
  ['triangle','diamond','hexagon'],
  ['triangle','diamond','star'],
  ['triangle','diamond','cross'],
  ['triangle','pentagon','hexagon'],
  ['triangle','pentagon','star'],
  ['triangle','pentagon','cross'],
  ['triangle','hexagon','star'],
  ['triangle','hexagon','cross'],
  ['triangle','star','cross'],
  ['diamond','pentagon','hexagon'],
  ['diamond','pentagon','star'],
  ['diamond','pentagon','cross'],
  ['diamond','hexagon','star'],
  ['diamond','hexagon','cross'],
  ['diamond','star','cross'],
  ['pentagon','hexagon','star'],
  ['pentagon','hexagon','cross'],
  ['pentagon','star','cross'],
  ['hexagon','star','cross'],
];

const FILL_TRIPLES: [Fill,Fill,Fill][] = [
  ['solid','empty','striped'],
  ['solid','empty','dotted'],
  ['solid','striped','dotted'],
  ['empty','striped','dotted'],
];

const ROT_TRIPLES: [number,number,number][] = [
  [0, 90, 180],
  [0, 90, 270],
  [0, 45, 90],
  [0, 45, 135],
  [45, 90, 135],
  [45, 135, 225],
  [90, 135, 180],
  [90, 180, 270],
  [0, 120, 240],
  [0, 60, 120],
];

const FILL_EXP: Record<Fill,string> = {
  solid: '채워진',
  empty: '빈',
  striped: '줄무늬',
  dotted: '점무늬',
};
const FILL_KO: Record<Fill,string> = { solid:'채움', empty:'빈', striped:'줄무늬', dotted:'점무늬' };
const SHAPE_KO: Record<Shape,string> = {
  circle:'원', square:'사각형', triangle:'삼각형', diamond:'마름모',
  pentagon:'오각형', hexagon:'육각형', star:'별', cross:'십자',
};

const QUESTIONS: FRTQuestion[] = [];
let qid = 1;

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A: Shape varies by ROW, Fill varies by COLUMN (250 questions)
// Pattern: cell(r,c) = shape[r] + fill[c]
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupA() {
  const sizes: Size[] = [1, 2, 3];
  for (let si = 0; si < SHAPE_TRIPLES.length && qid <= 250; si++) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    for (let fi = 0; fi < FILL_TRIPLES.length && qid <= 250; fi++) {
      const [f0,f1,f2] = FILL_TRIPLES[fi];
      const sz: Size = sizes[si % 3];
      const cells8 = m(
        f(s0,f0,sz), f(s0,f1,sz), f(s0,f2,sz),
        f(s1,f0,sz), f(s1,f1,sz), f(s1,f2,sz),
        f(s2,f0,sz), f(s2,f1,sz)
      );
      const correct = f(s2,f2,sz);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(s2,f0,sz), f(s0,f2,sz), f(s1,f2,sz),
        `각 행(가로줄)은 같은 도형(${SHAPE_KO[s0]},${SHAPE_KO[s1]},${SHAPE_KO[s2]})이고, ` +
        `각 열(세로줄)은 같은 채우기(${FILL_KO[f0]},${FILL_KO[f1]},${FILL_KO[f2]})입니다. ` +
        `물음표 위치는 ${SHAPE_KO[s2]} + ${FILL_KO[f2]}입니다.`
      ));
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B: Shape varies by COLUMN, Fill varies by ROW (150 questions, IDs 251-400)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupB() {
  let local = 0;
  for (let si = 5; si < SHAPE_TRIPLES.length && local < 150; si += 2) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    for (let fi = 0; fi < FILL_TRIPLES.length && local < 150; fi++) {
      const [f0,f1,f2] = FILL_TRIPLES[fi];
      const sz: Size = ((local % 3) + 1) as Size;
      // cell(r,c) = shape[c] + fill[r]
      const cells8 = m(
        f(s0,f0,sz), f(s1,f0,sz), f(s2,f0,sz),
        f(s0,f1,sz), f(s1,f1,sz), f(s2,f1,sz),
        f(s0,f2,sz), f(s1,f2,sz)
      );
      const correct = f(s2,f2,sz);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(s0,f2,sz), f(s2,f0,sz), f(s1,f2,sz),
        `각 열(세로줄)은 같은 도형(${SHAPE_KO[s0]},${SHAPE_KO[s1]},${SHAPE_KO[s2]})이고, ` +
        `각 행(가로줄)은 같은 채우기(${FILL_KO[f0]},${FILL_KO[f1]},${FILL_KO[f2]})입니다. ` +
        `물음표 위치는 ${SHAPE_KO[s2]} + ${FILL_KO[f2]}입니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP C: Shape varies by ROW, SIZE varies by COLUMN (small→medium→large) (150 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupC() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 150; si++) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    for (let fi = 0; fi < FILLS.length && local < 150; fi++) {
      const fill = FILLS[fi];
      const cells8 = m(
        f(s0,fill,1), f(s0,fill,2), f(s0,fill,3),
        f(s1,fill,1), f(s1,fill,2), f(s1,fill,3),
        f(s2,fill,1), f(s2,fill,2)
      );
      const correct = f(s2,fill,3);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(s2,fill,1), f(s0,fill,3), f(s1,fill,3),
        `각 행은 같은 도형이고, 각 열은 크기가 작음→중간→큼 순서로 증가합니다. ` +
        `물음표는 ${SHAPE_KO[s2]} (크게, ${FILL_KO[fill]})입니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP D: Shape varies by ROW, ROTATION varies by COLUMN (150 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupD() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 150; si++) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    const [r0,r1,r2] = ROT_TRIPLES[si % ROT_TRIPLES.length];
    const fill = FILLS[si % FILLS.length];
    const sz: Size = ((si % 3) + 1) as Size;
    const cells8 = m(
      f(s0,fill,sz,r0), f(s0,fill,sz,r1), f(s0,fill,sz,r2),
      f(s1,fill,sz,r0), f(s1,fill,sz,r1), f(s1,fill,sz,r2),
      f(s2,fill,sz,r0), f(s2,fill,sz,r1)
    );
    const correct = f(s2,fill,sz,r2);
    QUESTIONS.push(makeQ(
      qid++, cells8, correct,
      f(s2,fill,sz,r0), f(s0,fill,sz,r2), f(s1,fill,sz,r2),
      `각 행은 같은 도형이고, 각 열은 회전이 ${r0}°→${r1}°→${r2}° 순서로 변합니다. ` +
      `물음표는 ${SHAPE_KO[s2]}를 ${r2}° 회전한 모양입니다.`
    ));
    local++;
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP E: Shape varies by ROW, COUNT varies by COLUMN (1→2→3) (100 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupE() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 100; si += 2) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    for (let fi = 0; fi < FILLS.length && local < 100; fi++) {
      const fill = FILLS[fi];
      const cells8 = m(
        f(s0,fill,2,0,1), f(s0,fill,2,0,2), f(s0,fill,2,0,3),
        f(s1,fill,2,0,1), f(s1,fill,2,0,2), f(s1,fill,2,0,3),
        f(s2,fill,2,0,1), f(s2,fill,2,0,2)
      );
      const correct = f(s2,fill,2,0,3);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(s2,fill,2,0,1), f(s0,fill,2,0,3), f(s1,fill,2,0,3),
        `각 행은 같은 도형이고, 각 열은 도형의 개수가 1개→2개→3개로 늘어납니다. ` +
        `물음표는 ${SHAPE_KO[s2]} 3개입니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP F: FILL varies by ROW, ROTATION varies by COLUMN (100 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupF() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 100; si += 3) {
    for (let ri = 0; ri < ROT_TRIPLES.length && local < 100; ri++) {
      const shape = SHAPES[si % SHAPES.length];
      const [f0,f1,f2] = FILL_TRIPLES[ri % FILL_TRIPLES.length];
      const [r0,r1,r2] = ROT_TRIPLES[ri];
      const sz: Size = ((local % 3) + 1) as Size;
      const cells8 = m(
        f(shape,f0,sz,r0), f(shape,f0,sz,r1), f(shape,f0,sz,r2),
        f(shape,f1,sz,r0), f(shape,f1,sz,r1), f(shape,f1,sz,r2),
        f(shape,f2,sz,r0), f(shape,f2,sz,r1)
      );
      const correct = f(shape,f2,sz,r2);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(shape,f2,sz,r0), f(shape,f0,sz,r2), f(shape,f1,sz,r2),
        `같은 도형(${SHAPE_KO[shape]})이고, ` +
        `각 행은 채우기가 ${FILL_KO[f0]}→${FILL_KO[f1]}→${FILL_KO[f2]} 변하고, ` +
        `각 열은 회전이 ${r0}°→${r1}°→${r2}° 변합니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP G: SIZE varies by ROW, FILL varies by COLUMN (same shape throughout) (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupG() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 50; shi++) {
    const shape = SHAPES[shi];
    for (let fi = 0; fi < FILL_TRIPLES.length && local < 50; fi++) {
      const [f0,f1,f2] = FILL_TRIPLES[fi];
      const cells8 = m(
        f(shape,f0,1), f(shape,f1,1), f(shape,f2,1),
        f(shape,f0,2), f(shape,f1,2), f(shape,f2,2),
        f(shape,f0,3), f(shape,f1,3)
      );
      const correct = f(shape,f2,3);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(shape,f2,1), f(shape,f0,3), f(shape,f1,3),
        `같은 도형(${SHAPE_KO[shape]})이고, ` +
        `각 행은 크기가 작음→중간→큼 변하고, ` +
        `각 열은 채우기가 ${FILL_KO[f0]}→${FILL_KO[f1]}→${FILL_KO[f2]} 변합니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP H: ROTATION varies by ROW, FILL varies by COLUMN (same shape) (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupH() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 50; shi++) {
    const shape = SHAPES[shi];
    for (let ri = 0; ri < ROT_TRIPLES.length && local < 50; ri++) {
      const [r0,r1,r2] = ROT_TRIPLES[ri];
      const [f0,f1,f2] = FILL_TRIPLES[ri % FILL_TRIPLES.length];
      const sz: Size = ((local % 3) + 1) as Size;
      const cells8 = m(
        f(shape,f0,sz,r0), f(shape,f1,sz,r0), f(shape,f2,sz,r0),
        f(shape,f0,sz,r1), f(shape,f1,sz,r1), f(shape,f2,sz,r1),
        f(shape,f0,sz,r2), f(shape,f1,sz,r2)
      );
      const correct = f(shape,f2,sz,r2);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(shape,f2,sz,r0), f(shape,f0,sz,r2), f(shape,f1,sz,r2),
        `같은 도형(${SHAPE_KO[shape]})이고, ` +
        `각 행은 회전이 ${r0}°→${r1}°→${r2}° 변하고, ` +
        `각 열은 채우기가 ${FILL_KO[f0]}→${FILL_KO[f1]}→${FILL_KO[f2]} 변합니다.`
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP I: Diagonal pattern — same shape on diagonal, different on off-diagonal
// Each diagonal has same fill. Complex 3×3 pattern (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupI() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 50; si += 3) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    const [f0,f1,f2] = FILL_TRIPLES[si % FILL_TRIPLES.length];
    const sz: Size = ((local % 3) + 1) as Size;
    // Main diagonal has same fill (f0), upper-right same (f1), lower-left same (f2)
    const cells8 = m(
      f(s0,f0,sz), f(s1,f1,sz), f(s2,f2,sz),
      f(s2,f1,sz), f(s0,f0,sz), f(s1,f2,sz),
      f(s1,f2,sz), f(s2,f1,sz)
    );
    const correct = f(s0,f0,sz);
    QUESTIONS.push(makeQ(
      qid++, cells8, correct,
      f(s0,f1,sz), f(s1,f0,sz), f(s2,f0,sz),
      `대각선 방향으로 같은 도형+채우기 쌍이 반복됩니다. ` +
      `물음표는 ${SHAPE_KO[s0]} (${FILL_KO[f0]})입니다.`
    ));
    local++;
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP J: SERIES completion — shape sequence (rotation increases) (100 Qs)
// 4 cells shown, 5th is answer (stored as series type)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupJ() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 100; shi++) {
    const shape = SHAPES[shi];
    for (let fi = 0; fi < FILLS.length && local < 100; fi++) {
      const fill = FILLS[fi];
      const sz: Size = ((local % 3) + 1) as Size;
      // Rotation increases by 45° each step
      const rStep = (local % 4 + 1) * 45;
      const r0 = 0, r1 = rStep, r2 = (rStep*2)%360, r3 = (rStep*3)%360, r4 = (rStep*4)%360;
      const cells4 = [f(shape,fill,sz,r0), f(shape,fill,sz,r1), f(shape,fill,sz,r2), f(shape,fill,sz,r3)];
      const correct = f(shape,fill,sz,r4);
      QUESTIONS.push(makeQ(
        qid++, cells4, correct,
        f(shape,fill,sz,(rStep*3+rStep/2)%360),
        f(shape,fill,sz,r2),
        f(shape,fill,sz,r1),
        `도형이 매번 ${rStep}°씩 회전합니다. 다음은 ${r4}° 회전입니다.`,
        'series'
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP K: SERIES — fill changes in cycle (solid→empty→striped→dotted→solid…) (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupK() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 50; shi++) {
    const shape = SHAPES[shi];
    for (let sz = 1; sz <= 3 && local < 50; sz++) {
      // Cycle: solid→empty→striped→dotted→solid
      const cycle: Fill[] = ['solid','empty','striped','dotted'];
      const start = local % 4;
      const f0 = cycle[start%4], f1 = cycle[(start+1)%4], f2 = cycle[(start+2)%4], f3 = cycle[(start+3)%4];
      const f4 = cycle[(start+4)%4];
      const cells4 = [f(shape,f0,sz as Size), f(shape,f1,sz as Size), f(shape,f2,sz as Size), f(shape,f3,sz as Size)];
      const correct = f(shape,f4,sz as Size);
      QUESTIONS.push(makeQ(
        qid++, cells4, correct,
        f(shape,f1,sz as Size),
        f(shape,f2,sz as Size),
        f(shape,f0,sz as Size),
        `채우기 방식이 ${FILL_KO[f0]}→${FILL_KO[f1]}→${FILL_KO[f2]}→${FILL_KO[f3]} 순서로 순환합니다. 다음은 ${FILL_KO[f4]}입니다.`,
        'series'
      ));
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP L: SERIES — size changes (small→medium→large→small…) with shape changes (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupL() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 50; si += 4) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    const fill = FILLS[local % FILLS.length];
    // Shape changes with each step, size cycles 1→2→3→1
    const cells4 = [
      f(s0,fill,1), f(s1,fill,2), f(s2,fill,3), f(s0,fill,1)
    ];
    const correct = f(s1,fill,2);
    QUESTIONS.push(makeQ(
      qid++, cells4, correct,
      f(s1,fill,1),
      f(s2,fill,2),
      f(s0,fill,2),
      `도형이 ${SHAPE_KO[s0]}→${SHAPE_KO[s1]}→${SHAPE_KO[s2]}→${SHAPE_KO[s0]} 순서로, 크기는 소→중→대→소 순서로 순환합니다.`,
      'series'
    ));
    local++;
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP M: ODD ONE OUT (5 items — 4 same pattern, 1 different) (100 Qs)
// Encoded as: 4 cells showing the 4 "same" items; answer is which would be the ODD one
// We re-use the matrix3x3 structure but with type oddOneOut
// cells[0..3] = 4 same-pattern items; cells[4..7] = 4 possible "5th items"
// The answer option is the one that DOESN'T match the pattern of cells[0..3]
// For clarity: cells[0..4] are the 5 items shown; options[0..3] identify which is the ODD one
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupM() {
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < 100; si++) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    const s3: Shape = SHAPES[(si + 3) % SHAPES.length];
    const fill: Fill = FILLS[si % FILLS.length];
    const sz: Size = ((local % 3) + 1) as Size;
    // 4 items: s0,s1,s2,s3 all same fill and size → "same" group
    // odd one: different fill
    const oddFill: Fill = FILLS[(FILLS.indexOf(fill) + 1) % FILLS.length];
    const oddPos = local % 4; // which of the 5 items is odd

    // Build 5 items: 4 same + 1 odd at position oddPos
    const items: Fig[] = [f(s0,fill,sz), f(s1,fill,sz), f(s2,fill,sz), f(s3,fill,sz)];
    items.splice(oddPos, 0, f(SHAPES[(si+4)%SHAPES.length], oddFill, sz));
    // cells = 5 items (stored in cells[0..4])
    // In the UI: show 5 items, pick which is different
    // We encode: cells = 5 items; options = [item0, item1, item2, item3] where one is the odd
    // answer = oddPos (0-3) — but oddPos might be 4, so mod 4 for answer placement
    const answerPos = oddPos % 4;
    QUESTIONS.push({
      id: qid++,
      type: 'oddOneOut',
      cells: items,
      options: [items[0], items[1], items[2], items[3]] as [Fig,Fig,Fig,Fig],
      answer: answerPos,
      explanation: `나머지 4개는 ${FILL_KO[fill]} 채우기이지만, ` +
        `${answerPos+1}번 도형은 ${FILL_KO[oddFill]} 채우기로 다릅니다.`,
    });
    local++;
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP N: ODD ONE OUT — shape is different (100 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupN() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 100; shi++) {
    for (let fi = 0; fi < FILLS.length && local < 100; fi++) {
      const mainShape = SHAPES[shi];
      const oddShape: Shape = SHAPES[(shi + 1 + local % 6) % SHAPES.length];
      const fill = FILLS[fi];
      const sz: Size = ((local % 3) + 1) as Size;
      const oddPos = local % 4;
      const items: Fig[] = [
        f(mainShape,fill,sz), f(mainShape,fill,sz), f(mainShape,fill,sz), f(mainShape,fill,sz)
      ];
      items[oddPos] = f(oddShape, fill, sz);
      QUESTIONS.push({
        id: qid++,
        type: 'oddOneOut',
        cells: items,
        options: items as [Fig,Fig,Fig,Fig],
        answer: oddPos,
        explanation: `나머지 3개는 ${SHAPE_KO[mainShape]}이지만, ` +
          `${oddPos+1}번 도형은 ${SHAPE_KO[oddShape]}으로 다릅니다.`,
      });
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP O: ODD ONE OUT — rotation is different (50 Qs)
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupO() {
  let local = 0;
  for (let shi = 0; shi < SHAPES.length && local < 50; shi++) {
    for (let fi = 0; fi < FILLS.length && local < 50; fi++) {
      const shape = SHAPES[shi];
      const fill = FILLS[fi];
      const sz: Size = ((local % 3) + 1) as Size;
      const mainRot = ROTS[local % ROTS.length];
      const oddRot = ROTS[(local + 2) % ROTS.length];
      const oddPos = local % 4;
      const items: Fig[] = [
        f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot)
      ];
      items[oddPos] = f(shape, fill, sz, oddRot);
      QUESTIONS.push({
        id: qid++,
        type: 'oddOneOut',
        cells: items,
        options: items as [Fig,Fig,Fig,Fig],
        answer: oddPos,
        explanation: `나머지 3개는 ${mainRot}° 방향이지만, ` +
          `${oddPos+1}번 도형은 ${oddRot}° 방향으로 다릅니다.`,
      });
      local++;
    }
  }
})();

// ═══════════════════════════════════════════════════════════════════════════════
// Fill to reach 1000 total — more Group A variations with different sizes/rotations
// ═══════════════════════════════════════════════════════════════════════════════
(function genGroupExtra() {
  const needed = 1000 - QUESTIONS.length;
  let local = 0;
  for (let si = 0; si < SHAPE_TRIPLES.length && local < needed; si++) {
    const [s0,s1,s2] = SHAPE_TRIPLES[si];
    for (let ri = 0; ri < ROT_TRIPLES.length && local < needed; ri++) {
      const [r0,r1,r2] = ROT_TRIPLES[ri];
      const [f0,f1,f2] = FILL_TRIPLES[ri % FILL_TRIPLES.length];
      const sz: Size = ((si + ri) % 3 + 1) as Size;
      // Shape by row, rotation by column, same fill
      const cells8 = m(
        f(s0,f0,sz,r0), f(s0,f1,sz,r1), f(s0,f2,sz,r2),
        f(s1,f0,sz,r0), f(s1,f1,sz,r1), f(s1,f2,sz,r2),
        f(s2,f0,sz,r0), f(s2,f1,sz,r1)
      );
      const correct = f(s2,f2,sz,r2);
      QUESTIONS.push(makeQ(
        qid++, cells8, correct,
        f(s2,f0,sz,r0), f(s0,f2,sz,r2), f(s1,f2,sz,r2),
        `각 행은 같은 도형, 각 열은 같은 채우기(${FILL_KO[f0]},${FILL_KO[f1]},${FILL_KO[f2]})와 회전(${r0}°,${r1}°,${r2}°)이 적용됩니다. ` +
        `물음표는 ${SHAPE_KO[s2]} + ${FILL_KO[f2]} + ${r2}° 회전입니다.`
      ));
      local++;
    }
  }
})();

export const ALL_FRT_QUESTIONS: FRTQuestion[] = QUESTIONS.slice(0, 1000);
