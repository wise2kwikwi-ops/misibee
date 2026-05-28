import type { Fig, Shape, Fill, Size, FRTQuestion } from './frtTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function f(shape: Shape, fill: Fill = 'solid', size: Size = 2, rotation = 0, count = 1): Fig {
  return { shape, fill, size, rotation, count };
}

function makeQ5(
  id: number,
  cells: Fig[],
  correct: Fig,
  d1: Fig, d2: Fig, d3: Fig, d4: Fig,
  explanation: string,
  type: FRTQuestion['type'] = 'matrix3x3',
  difficulty: FRTQuestion['difficulty'] = 1,
): FRTQuestion {
  const pos = id % 5;
  const pool = [d1, d2, d3, d4];
  const opts: [Fig, Fig, Fig, Fig, Fig] = [d1, d2, d3, d4, d1];
  let pi = 0;
  for (let i = 0; i < 5; i++) {
    if (i === pos) opts[i] = correct;
    else opts[i] = pool[pi++];
  }
  return { id, type, cells, options: opts, answer: pos, difficulty, explanation };
}

function m(
  r0c0: Fig, r0c1: Fig, r0c2: Fig,
  r1c0: Fig, r1c1: Fig, r1c2: Fig,
  r2c0: Fig, r2c1: Fig,
): Fig[] {
  return [r0c0, r0c1, r0c2, r1c0, r1c1, r1c2, r2c0, r2c1];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'pentagon', 'hexagon', 'star', 'cross'];
const FILLS: Fill[] = ['solid', 'empty', 'striped', 'dotted'];
const ROTS = [0, 45, 90, 135, 180, 225, 270, 315];

const ST: [Shape, Shape, Shape][] = [
  ['circle', 'square', 'triangle'],   ['circle', 'square', 'diamond'],
  ['circle', 'square', 'pentagon'],   ['circle', 'square', 'hexagon'],
  ['circle', 'square', 'star'],       ['circle', 'square', 'cross'],
  ['circle', 'triangle', 'diamond'],  ['circle', 'triangle', 'pentagon'],
  ['circle', 'triangle', 'hexagon'],  ['circle', 'triangle', 'star'],
  ['circle', 'diamond', 'pentagon'],  ['circle', 'diamond', 'hexagon'],
  ['circle', 'diamond', 'star'],      ['circle', 'pentagon', 'hexagon'],
  ['circle', 'pentagon', 'star'],     ['circle', 'hexagon', 'star'],
  ['square', 'triangle', 'diamond'],  ['square', 'triangle', 'pentagon'],
  ['square', 'triangle', 'hexagon'],  ['square', 'triangle', 'star'],
  ['square', 'diamond', 'pentagon'],  ['square', 'pentagon', 'hexagon'],
  ['triangle', 'diamond', 'pentagon'], ['triangle', 'diamond', 'hexagon'],
  ['diamond', 'pentagon', 'hexagon'], ['pentagon', 'hexagon', 'star'],
  ['circle', 'cross', 'triangle'],    ['square', 'cross', 'diamond'],
];

const FT: [Fill, Fill, Fill][] = [
  ['solid', 'empty', 'striped'],
  ['solid', 'empty', 'dotted'],
  ['solid', 'striped', 'dotted'],
  ['empty', 'striped', 'dotted'],
];

const RT: [number, number, number][] = [
  [0, 90, 180],   [0, 45, 90],    [90, 135, 180], [45, 90, 135],
  [0, 90, 270],   [0, 120, 240],  [0, 60, 120],   [180, 225, 270],
  [45, 135, 225], [90, 180, 270],
];

// Latin squares of order 3
// LS_CYC[r][c] = (r+c)%3   — answer at (2,2) → index 1
const LS_CYC = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
// LS_REV[r][c] = (r*2+c)%3 — answer at (2,2) → index 0
const LS_REV = [[0, 1, 2], [2, 0, 1], [1, 2, 0]];

const diagSz = (r: number, c: number): Size => (((r + c) % 3) + 1) as Size;

// Rotational symmetry period (degrees) for each shape in FigureCell.tsx
const ROT_PERIOD: Record<Shape, number> = {
  circle: 1, square: 90, cross: 90, diamond: 90,
  hexagon: 60, triangle: 120, pentagon: 72, star: 72,
};

// Returns true iff all angles produce visually distinct appearances for the shape
function rotDistinct(shape: Shape, angles: number[]): boolean {
  const p = ROT_PERIOD[shape];
  if (p === 1) return false;
  const mods = angles.map(a => ((a % p) + p) % p);
  return new Set(mods).size === angles.length;
}

const SHAPE_KO: Record<Shape, string> = {
  circle: '원', square: '사각형', triangle: '삼각형', diamond: '마름모',
  pentagon: '오각형', hexagon: '육각형', star: '별', cross: '십자',
};
const FILL_KO: Record<Fill, string> = {
  solid: '채움', empty: '빈', striped: '줄무늬', dotted: '점무늬',
};

const QUESTIONS: FRTQuestion[] = [];
let qid = 1;

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 1 — Row=Shape, Col=Fill  (150q)
// Classic grid rule: shape determined by row, fill by column
// ══════════════════════════════════════════════════════════════════════════════
(function genL1() {
  let n = 0;
  outer: for (let sz = 1; sz <= 3; sz++) {
    for (let si = 0; si < ST.length; si++) {
      for (let fi = 0; fi < FT.length; fi++) {
        if (n >= 150) break outer;
        const [s0, s1, s2] = ST[si];
        const [f0, f1, f2] = FT[fi];
        const s = sz as Size;
        const cells8 = m(
          f(s0, f0, s), f(s0, f1, s), f(s0, f2, s),
          f(s1, f0, s), f(s1, f1, s), f(s1, f2, s),
          f(s2, f0, s), f(s2, f1, s),
        );
        const correct = f(s2, f2, s);
        const d1 = f(s2, f0, s); // right shape, wrong fill col0
        const d2 = f(s2, f1, s); // right shape, wrong fill col1
        const d3 = f(s0, f2, s); // wrong shape row0, right fill
        const d4 = f(s1, f2, s); // wrong shape row1, right fill
        QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
          `행 규칙: ${SHAPE_KO[s2]} / 열 규칙: ${FILL_KO[f2]}`,
          'matrix3x3', 1));
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 2a — Latin Square: Shapes  (100q)  ★ 멘사 실전 유형
// 각 행·열에 세 가지 형태가 정확히 1번씩 등장 (라틴 방진)
// Cell(r,c): shape=S[LS_CYC[r][c]], fill=F[r]
// 행2 = [s2,s0,s1] → 정답 위치(2,2): shape=s1, fill=f2
// ══════════════════════════════════════════════════════════════════════════════
(function genL2a() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 100) break outer;
      const [s0, s1, s2] = ST[si];
      const [f0, f1, f2] = FT[fi];
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0, f0, sz), f(s1, f0, sz), f(s2, f0, sz),
        f(s1, f1, sz), f(s2, f1, sz), f(s0, f1, sz),
        f(s2, f2, sz), f(s0, f2, sz),
      );
      // Row2 shapes: [s2,s0,s1] → (2,2)=s1; col2 shapes: [s2,s0,s1] → s1 ✓
      const correct = f(s1, f2, sz);
      const d1 = f(s0, f2, sz); // wrong shape: s0 already in row2 col1
      const d2 = f(s2, f2, sz); // wrong shape: s2 already in row2 col0
      const d3 = f(s1, f0, sz); // right shape, wrong fill (f0=row0)
      const d4 = f(s1, f1, sz); // right shape, wrong fill (f1=row1)
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `형태 라틴 방진: 각 행·열에 ${SHAPE_KO[s0]}·${SHAPE_KO[s1]}·${SHAPE_KO[s2]} 1번씩. 행 채우기=${FILL_KO[f2]}`,
        'matrix3x3', 2));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 2b — Latin Square: Fills  (100q)  ★ 멘사 실전 유형
// 각 행·열에 세 가지 채우기가 정확히 1번씩 등장 (라틴 방진)
// Cell(r,c): shape=S[r], fill=F[LS_CYC[r][c]]
// 행2 = [f2,f0,f1] → 정답 위치(2,2): shape=s2, fill=f1
// ══════════════════════════════════════════════════════════════════════════════
(function genL2b() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 100) break outer;
      const [s0, s1, s2] = ST[si];
      const [f0, f1, f2] = FT[fi];
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0, f0, sz), f(s0, f1, sz), f(s0, f2, sz),
        f(s1, f1, sz), f(s1, f2, sz), f(s1, f0, sz),
        f(s2, f2, sz), f(s2, f0, sz),
      );
      // Row2 fills: [f2,f0,f1] → (2,2)=f1; col2 fills: [f2,f0,f1] → f1 ✓
      const correct = f(s2, f1, sz);
      const d1 = f(s2, f0, sz); // wrong fill: f0 already in row2 col1
      const d2 = f(s2, f2, sz); // wrong fill: f2 already in row2 col0
      const d3 = f(s0, f1, sz); // wrong shape (row0), right fill
      const d4 = f(s1, f1, sz); // wrong shape (row1), right fill
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `채우기 라틴 방진: 각 행·열에 ${FILL_KO[f0]}·${FILL_KO[f1]}·${FILL_KO[f2]} 1번씩. 행 형태=${SHAPE_KO[s2]}`,
        'matrix3x3', 2));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 3a — Dual Latin Square  (100q)  ★★ 멘사 코리아 핵심 유형
// 형태와 채우기 모두 독립적으로 라틴 방진 구성
// Cell(r,c): shape=S[LS_CYC[r][c]], fill=F[LS_REV[r][c]]
// Row0: (s0,f0),(s1,f1),(s2,f2) | Row1: (s1,f2),(s2,f0),(s0,f1)
// Row2: (s2,f1),(s0,f2), ? → 행2에 없는 형태=s1, 채우기=f0
// ══════════════════════════════════════════════════════════════════════════════
(function genL3a() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 100) break outer;
      const [s0, s1, s2] = ST[si];
      const [f0, f1, f2] = FT[fi];
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0, f0, sz), f(s1, f1, sz), f(s2, f2, sz),
        f(s1, f2, sz), f(s2, f0, sz), f(s0, f1, sz),
        f(s2, f1, sz), f(s0, f2, sz),
      );
      // Row2 shapes [s2,s0,?]→s1; fills [f1,f2,?]→f0
      const correct = f(s1, f0, sz);
      const d1 = f(s0, f0, sz); // wrong shape (s0 in row2 col1)
      const d2 = f(s2, f0, sz); // wrong shape (s2 in row2 col0)
      const d3 = f(s1, f1, sz); // right shape, wrong fill (f1 in row2 col0)
      const d4 = f(s1, f2, sz); // right shape, wrong fill (f2 in row2 col1)
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `이중 라틴: 형태(${SHAPE_KO[s0]}·${SHAPE_KO[s1]}·${SHAPE_KO[s2]})와 채우기(${FILL_KO[f0]}·${FILL_KO[f1]}·${FILL_KO[f2]}) 각 행·열 1번씩. 정답: ${SHAPE_KO[s1]}/${FILL_KO[f0]}`,
        'matrix3x3', 3));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 3b — Latin Square Shape + Column Rotation  (100q)
// Cell(r,c): shape=S[LS_CYC[r][c]], fill=F[r], rotation=R[c]
// 정답(2,2): shape=s1, fill=f2, rotation=r2
// ══════════════════════════════════════════════════════════════════════════════
(function genL3b() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 100) break outer;
      const [s0, s1, s2] = ST[si];
      const fi = (si + ri) % FT.length;
      const [f0, f1, f2] = FT[fi];
      const [r0, r1, r2] = RT[ri];
      // Skip if s1 (answer shape) can't visually distinguish the three column rotations
      if (!rotDistinct(s1, [r0, r1, r2])) continue;
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0, f0, sz, r0), f(s1, f0, sz, r1), f(s2, f0, sz, r2),
        f(s1, f1, sz, r0), f(s2, f1, sz, r1), f(s0, f1, sz, r2),
        f(s2, f2, sz, r0), f(s0, f2, sz, r1),
      );
      const correct = f(s1, f2, sz, r2);
      const d1 = f(s1, f2, sz, r0); // wrong rotation (safe: rotDistinct ensures r0≠r2 visually)
      const d2 = f(s1, f1, sz, r2); // wrong fill (always clearly visible)
      const d3 = f(s0, f2, sz, r2); // wrong shape (s0 in row2 col1)
      const d4 = f(s2, f2, sz, r2); // wrong shape (s2 in row2 col0)
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `라틴 형태 + 열별 회전: 형태 라틴, 채우기=행, 회전=열(${r0}°/${r1}°/${r2}°). 정답: ${SHAPE_KO[s1]}, ${FILL_KO[f2]}, ${r2}°`,
        'matrix3x3', 3));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 4a — Dual Latin + Diagonal Size  (80q)  ★★★ 멘사 코리아
// Cell(r,c): shape=S[LS_CYC[r][c]], fill=F[LS_REV[r][c]], size=diagSz(r,c)
// 정답(2,2): shape=s1, fill=f0, size=diagSz(2,2)=2
// ══════════════════════════════════════════════════════════════════════════════
(function genL4a() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 80) break outer;
      const [s0, s1, s2] = ST[si];
      const [f0, f1, f2] = FT[fi];
      const csz = diagSz(2, 2); // = 2
      const cells8 = m(
        f(s0, f0, diagSz(0, 0)), f(s1, f1, diagSz(0, 1)), f(s2, f2, diagSz(0, 2)),
        f(s1, f2, diagSz(1, 0)), f(s2, f0, diagSz(1, 1)), f(s0, f1, diagSz(1, 2)),
        f(s2, f1, diagSz(2, 0)), f(s0, f2, diagSz(2, 1)),
      );
      const correct = f(s1, f0, csz);
      const altSz: Size = csz === 2 ? 3 : 2;
      const d1 = f(s1, f0, altSz);  // right shape+fill, wrong size
      const d2 = f(s0, f0, csz);    // wrong shape
      const d3 = f(s1, f1, csz);    // right shape, wrong fill
      const d4 = f(s1, f2, csz);    // right shape, wrong fill
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `이중 라틴 + 대각 크기: 형태·채우기 라틴 방진, 크기=(행+열)%3+1. 정답: ${SHAPE_KO[s1]}, ${FILL_KO[f0]}, 크기${csz}`,
        'matrix3x3', 4));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 4b — Dual Latin + Diagonal Size + Column Rotation  (70q)  ★★★★
// Cell(r,c): shape=S[LS_CYC[r][c]], fill=F[LS_REV[r][c]], size=diagSz, rot=R[c]
// 정답(2,2): shape=s1, fill=f0, size=2, rotation=r2
// ══════════════════════════════════════════════════════════════════════════════
(function genL4b() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 70) break outer;
      const [s0, s1, s2] = ST[si];
      const fi = (si + ri) % FT.length;
      const [f0, f1, f2] = FT[fi];
      const [r0, r1, r2] = RT[ri];
      // Skip if s1 can't visually distinguish the three column rotations
      if (!rotDistinct(s1, [r0, r1, r2])) continue;
      const cells8 = m(
        f(s0, f0, diagSz(0, 0), r0), f(s1, f1, diagSz(0, 1), r1), f(s2, f2, diagSz(0, 2), r2),
        f(s1, f2, diagSz(1, 0), r0), f(s2, f0, diagSz(1, 1), r1), f(s0, f1, diagSz(1, 2), r2),
        f(s2, f1, diagSz(2, 0), r0), f(s0, f2, diagSz(2, 1), r1),
      );
      const csz = diagSz(2, 2);
      const correct = f(s1, f0, csz, r2);
      const d1 = f(s1, f0, csz, r0);  // wrong rotation (safe after filter)
      const d2 = f(s1, f1, csz, r2);  // wrong fill (always clearly visible)
      const d3 = f(s0, f0, csz, r2);  // wrong shape
      const d4 = f(s1, f2, csz, r2);  // wrong fill
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `이중 라틴 + 대각 크기 + 열 회전: 4가지 규칙 동시 적용. 정답: ${SHAPE_KO[s1]}, ${FILL_KO[f0]}, 크기${csz}, ${r2}°`,
        'matrix3x3', 4));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 5 — Cyclic Offset + Count  (50q)  ★★★★★ 노르웨이 멘사 수준
// Cell(r,c): shape=S[r], fill=F[c], rotation=R[(r+c)%3], count=(r+c)%3+1
// 정답(2,2): shape=s2, fill=f2, rotation=R[1]=r1, count=2
// ══════════════════════════════════════════════════════════════════════════════
(function genL5() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 50) break outer;
      const [s0, s1, s2] = ST[si];
      const [f0, f1, f2] = FT[fi];
      const ri = (si + fi) % RT.length;
      const [r0, r1, r2] = RT[ri];
      const rot = (r: number, c: number) => [r0, r1, r2][(r + c) % 3];
      const cnt = (r: number, c: number) => (r + c) % 3 + 1;
      const cells8 = m(
        f(s0, f0, 2, rot(0, 0), cnt(0, 0)), f(s0, f1, 2, rot(0, 1), cnt(0, 1)), f(s0, f2, 2, rot(0, 2), cnt(0, 2)),
        f(s1, f0, 2, rot(1, 0), cnt(1, 0)), f(s1, f1, 2, rot(1, 1), cnt(1, 1)), f(s1, f2, 2, rot(1, 2), cnt(1, 2)),
        f(s2, f0, 2, rot(2, 0), cnt(2, 0)), f(s2, f1, 2, rot(2, 1), cnt(2, 1)),
      );
      const correct = f(s2, f2, 2, rot(2, 2), cnt(2, 2));
      // Avoid rotation-only distractors that look identical for symmetric shapes
      const altCnt = cnt(2, 2) === 1 ? 3 : 1;
      const d1 = f(s2, f2, 2, rot(2, 2), altCnt);     // wrong count (always visible)
      const d2 = f(s2, f1, 2, rot(2, 2), cnt(2, 2));  // wrong fill (always visible)
      const d3 = f(s2, f2, 2, rot(2, 2), 3);          // wrong count
      const d4 = f(s2, f0, 2, rot(2, 2), cnt(2, 2));  // wrong fill
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `순환 패턴: 회전=(행+열)%3번째 각도, 개수=(행+열)%3+1. 정답: ${SHAPE_KO[s2]}, ${FILL_KO[f2]}, ${rot(2, 2)}°, ${cnt(2, 2)}개`,
        'matrix3x3', 5));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L2 — Rotation delta series  (50q)
// 고정 회전각 증가 수열 — 다음 원소를 맞추시오
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL2() {
  // Only shapes where rotation produces clearly distinct appearances
  const ROT_SHAPES: Shape[] = ['triangle', 'pentagon', 'star'];
  let n = 0;
  outer: for (let shi = 0; shi < ROT_SHAPES.length; shi++) {
    const shape = ROT_SHAPES[shi];
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 50) break outer;
      const [r0, r1, r2] = RT[ri];
      const dr = ((r1 - r0) + 360) % 360;
      const r3 = (r2 + dr) % 360;
      // Skip if correct answer looks same as d1 (r3=r0) or series items look same
      if (!rotDistinct(shape, [r0, r1, r2, r3])) continue;
      for (let fi = 0; fi < FILLS.length && n < 50; fi++) {
        for (let sz = 1; sz <= 3 && n < 50; sz++) {
          const fill = FILLS[fi];
          const s = sz as Size;
          const r_back = (r2 - dr + 360) % 360;
          // Skip if back-step distractor equals correct
          if (r_back === r3) continue;
          const cells = [f(shape, fill, s, r0), f(shape, fill, s, r1), f(shape, fill, s, r2)];
          const correct = f(shape, fill, s, r3);
          const d1 = f(shape, fill, s, r0);                            // went back to start
          const d2 = f(shape, fill, s, r_back);                        // one step back
          const d3 = f(ROT_SHAPES[(shi + 1) % ROT_SHAPES.length], fill, s, r3); // wrong shape
          const d4 = f(shape, FILLS[(fi + 1) % 4], s, r3);             // wrong fill
          QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
            `매 단계 ${dr}° 회전 — 다음은 ${r3}°`,
            'series', 2));
          n++;
        }
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L3 — Fill + Rotation dual cycle  (50q)
// 채우기 순환 + 매 단계 90° 회전 — 4번째 원소를 맞추시오
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL3() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      for (let sz = 1; sz <= 3; sz++) {
        if (n >= 50) break outer;
        const shape = SHAPES[shi];
        const s = sz as Size;
        const fills: Fill[] = [FILLS[fi % 4], FILLS[(fi + 1) % 4], FILLS[(fi + 2) % 4]];
        const cFill: Fill = FILLS[(fi + 3) % 4];
        const cells = [
          f(shape, fills[0], s, 0),
          f(shape, fills[1], s, 90),
          f(shape, fills[2], s, 180),
        ];
        const correct = f(shape, cFill, s, 270);
        // All distractors use rotation=270 so fill is always the clear discriminator
        const d1 = f(shape, fills[0], s, 270);             // wrong fill (step 0's fill)
        const d2 = f(shape, fills[1], s, 270);             // wrong fill (step 1's fill)
        const d3 = f(shape, fills[2], s, 270);             // wrong fill (step 2's fill)
        const d4 = f(SHAPES[(shi + 1) % 8], cFill, s, 270); // wrong shape
        QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
          `채우기: ${FILL_KO[fills[0]]}→${FILL_KO[fills[1]]}→${FILL_KO[fills[2]]}→${FILL_KO[cFill]}, 회전: 0→90→180→270°`,
          'series', 3));
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L4 — Shape + Fill + Size triple cycle  (50q)
// 형태·채우기·크기 동시 순환 — 크기는 1→2→3→1 반복
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL4() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 50) break outer;
      const [s0, s1, s2] = ST[si];
      const s3: Shape = SHAPES[(SHAPES.indexOf(s0) + 3) % 8];
      const [f0, f1, f2] = FT[fi];
      const f3: Fill = FILLS[(FILLS.indexOf(f0) + 3) % 4];
      const cells = [f(s0, f0, 1, 0), f(s1, f1, 2, 0), f(s2, f2, 3, 0)];
      const correct = f(s3, f3, 1, 0); // size wraps back to 1
      const d1 = f(s3, f3, 3, 0);      // wrong size (no wrap)
      const d2 = f(s3, f0, 1, 0);      // wrong fill
      const d3 = f(s0, f3, 1, 0);      // wrong shape
      const d4 = f(s3, f3, 2, 0);      // wrong size
      QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
        `형태·채우기·크기 동시 순환. 크기 1→2→3→1 반복. 다음: ${SHAPE_KO[s3]}, ${FILL_KO[f3]}, 크기1`,
        'series', 4));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Shape (50q)  난이도 1
// ══════════════════════════════════════════════════════════════════════════════
(function genOddShape() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      for (let sz = 1; sz <= 3; sz++) {
        if (n >= 50) break outer;
        const shape = SHAPES[shi];
        const fill = FILLS[fi];
        const s = sz as Size;
        const oddShape: Shape = SHAPES[(shi + 1 + n % 6) % SHAPES.length];
        const oddPos = n % 5;
        const items: [Fig, Fig, Fig, Fig, Fig] = [
          f(shape, fill, s), f(shape, fill, s), f(shape, fill, s),
          f(shape, fill, s), f(shape, fill, s),
        ];
        items[oddPos] = f(oddShape, fill, s);
        QUESTIONS.push({
          id: qid++, type: 'oddOneOut', cells: items,
          options: items,
          answer: oddPos, difficulty: 1,
          explanation: `나머지 4개는 ${SHAPE_KO[shape]}이지만 ${oddPos + 1}번은 ${SHAPE_KO[oddShape]}입니다.`,
        });
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Fill (30q)  난이도 1
// ══════════════════════════════════════════════════════════════════════════════
(function genOddFill() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      if (n >= 30) break outer;
      const shape = SHAPES[shi];
      const fill = FILLS[fi];
      const oddFill: Fill = FILLS[(fi + 1 + n % 3) % 4];
      const sz: Size = ((n % 3) + 1) as Size;
      const oddPos = n % 5;
      const items: [Fig, Fig, Fig, Fig, Fig] = [
        f(shape, fill, sz), f(shape, fill, sz), f(shape, fill, sz),
        f(shape, fill, sz), f(shape, fill, sz),
      ];
      items[oddPos] = f(shape, oddFill, sz);
      QUESTIONS.push({
        id: qid++, type: 'oddOneOut', cells: items,
        options: items,
        answer: oddPos, difficulty: 1,
        explanation: `나머지 4개는 ${FILL_KO[fill]} 채우기이지만 ${oddPos + 1}번은 ${FILL_KO[oddFill]} 채우기입니다.`,
      });
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Size (20q)  난이도 2
// 크기 차이는 어떤 도형이든 항상 명확하게 보임
// ══════════════════════════════════════════════════════════════════════════════
(function genOddSize() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      if (n >= 20) break outer;
      const shape = SHAPES[shi];
      const fill = FILLS[fi];
      const mainSz: Size = 2;
      const oddSz: Size = (n % 2 === 0) ? 1 : 3;
      const oddPos = n % 5;
      const items: [Fig, Fig, Fig, Fig, Fig] = [
        f(shape, fill, mainSz), f(shape, fill, mainSz), f(shape, fill, mainSz),
        f(shape, fill, mainSz), f(shape, fill, mainSz),
      ];
      items[oddPos] = f(shape, fill, oddSz);
      QUESTIONS.push({
        id: qid++, type: 'oddOneOut', cells: items,
        options: items,
        answer: oddPos, difficulty: 2,
        explanation: `나머지 4개는 중간 크기이지만 ${oddPos + 1}번만 ${oddSz === 1 ? '작은' : '큰'} 크기입니다.`,
      });
      n++;
    }
  }
})();

export const ALL_FRT_QUESTIONS: FRTQuestion[] = QUESTIONS.slice(0, 1000);
