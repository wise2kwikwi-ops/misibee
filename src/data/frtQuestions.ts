import type { Fig, Shape, Fill, Size, FRTQuestion } from './frtTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function f(shape: Shape, fill: Fill = 'solid', size: Size = 2, rotation = 0, count = 1): Fig {
  return { shape, fill, size, rotation, count };
}

// Place correct answer at position (id % 5) among 4 distractors
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

function m(r0c0:Fig,r0c1:Fig,r0c2:Fig,r1c0:Fig,r1c1:Fig,r1c2:Fig,r2c0:Fig,r2c1:Fig): Fig[] {
  return [r0c0,r0c1,r0c2,r1c0,r1c1,r1c2,r2c0,r2c1];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHAPES: Shape[] = ['circle','square','triangle','diamond','pentagon','hexagon','star','cross'];
const FILLS: Fill[] = ['solid','empty','striped','dotted'];
const ROTS = [0, 45, 90, 135, 180, 225, 270, 315];

// All distinct shape triples
const ST: [Shape,Shape,Shape][] = [
  ['circle','square','triangle'],   ['circle','square','diamond'],
  ['circle','square','pentagon'],   ['circle','square','hexagon'],
  ['circle','square','star'],       ['circle','square','cross'],
  ['circle','triangle','diamond'],  ['circle','triangle','pentagon'],
  ['circle','triangle','hexagon'],  ['circle','triangle','star'],
  ['circle','diamond','pentagon'],  ['circle','diamond','hexagon'],
  ['circle','diamond','star'],      ['circle','pentagon','hexagon'],
  ['circle','pentagon','star'],     ['circle','hexagon','star'],
  ['square','triangle','diamond'],  ['square','triangle','pentagon'],
  ['square','triangle','hexagon'],  ['square','triangle','star'],
  ['square','diamond','pentagon'],  ['square','pentagon','hexagon'],
  ['triangle','diamond','pentagon'],['triangle','diamond','hexagon'],
  ['diamond','pentagon','hexagon'], ['pentagon','hexagon','star'],
  ['circle','cross','triangle'],    ['square','cross','diamond'],
];

const FT: [Fill,Fill,Fill][] = [
  ['solid','empty','striped'],
  ['solid','empty','dotted'],
  ['solid','striped','dotted'],
  ['empty','striped','dotted'],
];

const RT: [number,number,number][] = [
  [0,90,180], [0,45,90],  [90,135,180],[45,90,135],
  [0,90,270], [0,120,240],[0,60,120],  [180,225,270],
  [45,135,225],[90,180,270],
];

const SHAPE_KO: Record<Shape,string> = {
  circle:'원', square:'사각형', triangle:'삼각형', diamond:'마름모',
  pentagon:'오각형', hexagon:'육각형', star:'별', cross:'십자',
};
const FILL_KO: Record<Fill,string> = {
  solid:'채움', empty:'빈', striped:'줄무늬', dotted:'점무늬',
};

// ─── Size at grid position ─────────────────────────────────────────────────────
const diagSz = (r: number, c: number): Size => (((r + c) % 3) + 1) as Size;

// ─── Question pool ─────────────────────────────────────────────────────────────
const QUESTIONS: FRTQuestion[] = [];
let qid = 1;

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 1 — Shape × Fill  (200q)
// Rule 1: shape follows row  /  Rule 2: fill follows column
// Distractors: each violates exactly one rule — 4 clearly wrong but plausible
// ══════════════════════════════════════════════════════════════════════════════
(function genL1() {
  let n = 0;
  outer: for (let sz = 1; sz <= 3; sz++) {
    for (let si = 0; si < ST.length; si++) {
      for (let fi = 0; fi < FT.length; fi++) {
        if (n >= 200) break outer;
        const [s0,s1,s2] = ST[si];
        const [f0,f1,f2] = FT[fi];
        const s = sz as Size;
        const cells8 = m(
          f(s0,f0,s), f(s0,f1,s), f(s0,f2,s),
          f(s1,f0,s), f(s1,f1,s), f(s1,f2,s),
          f(s2,f0,s), f(s2,f1,s),
        );
        const correct = f(s2, f2, s);
        // wrong fill (right shape) — cols 0 and 1
        const d1 = f(s2, f0, s);
        const d2 = f(s2, f1, s);
        // wrong shape (right fill) — rows 0 and 1
        const d3 = f(s0, f2, s);
        const d4 = f(s1, f2, s);
        QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
          `행 규칙: ${SHAPE_KO[s2]}, 열 규칙: ${FILL_KO[f2]}`,
          'matrix3x3', 1));
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 2a — Shape × Fill × Size  (150q)
// Rule 1: shape(row)  / Rule 2: fill(col)  / Rule 3: size = (r+c)%3+1
// Distractors each violate exactly one of the three rules
// ══════════════════════════════════════════════════════════════════════════════
(function genL2a() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      for (let rot = 0; rot <= 1 && n < 150; rot++) {
        if (n >= 150) break outer;
        const [s0,s1,s2] = ST[si];
        const [f0,f1,f2] = FT[fi];
        const rotation = rot * 90;
        const cells8 = m(
          f(s0,f0,diagSz(0,0),rotation), f(s0,f1,diagSz(0,1),rotation), f(s0,f2,diagSz(0,2),rotation),
          f(s1,f0,diagSz(1,0),rotation), f(s1,f1,diagSz(1,1),rotation), f(s1,f2,diagSz(1,2),rotation),
          f(s2,f0,diagSz(2,0),rotation), f(s2,f1,diagSz(2,1),rotation),
        );
        const csz = diagSz(2,2); // correct size
        const correct = f(s2, f2, csz, rotation);
        // wrong size (right shape+fill)
        const altSz1: Size = csz === 1 ? 2 : 1;
        const altSz2: Size = csz === 3 ? 2 : 3;
        const d1 = f(s2, f2, altSz1, rotation);
        const d2 = f(s2, f2, altSz2, rotation);
        // wrong fill (right shape+size)
        const d3 = f(s2, f0, csz, rotation);
        // wrong shape (right fill+size)
        const d4 = f(s1, f2, csz, rotation);
        QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
          `형태: ${SHAPE_KO[s2]}, 채우기: ${FILL_KO[f2]}, 크기: ${csz} (대각선 증가 패턴)`,
          'matrix3x3', 2));
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 2b — Shape × Rotation  (100q)
// Rule 1: shape(row)  / Rule 2: rotation(col)
// ══════════════════════════════════════════════════════════════════════════════
(function genL2b() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 100) break outer;
      const [s0,s1,s2] = ST[si];
      const [r0,r1,r2] = RT[ri];
      const fill: Fill = FILLS[(si + ri) % 4];
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0,fill,sz,r0), f(s0,fill,sz,r1), f(s0,fill,sz,r2),
        f(s1,fill,sz,r0), f(s1,fill,sz,r1), f(s1,fill,sz,r2),
        f(s2,fill,sz,r0), f(s2,fill,sz,r1),
      );
      const correct = f(s2, fill, sz, r2);
      const d1 = f(s2, fill, sz, r0); // right shape, wrong rotation (col 0)
      const d2 = f(s2, fill, sz, r1); // right shape, wrong rotation (col 1)
      const d3 = f(s1, fill, sz, r2); // wrong shape, right rotation
      const d4 = f(s0, fill, sz, r2); // wrong shape, right rotation
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `형태: ${SHAPE_KO[s2]}, 회전: ${r2}° (행별 형태 변환, 열별 회전)`,
        'matrix3x3', 2));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 3a — Shape × Fill × Rotation  (150q)
// Rule 1: shape(row)  / Rule 2: fill(col)  / Rule 3: rotation(col)
// ══════════════════════════════════════════════════════════════════════════════
(function genL3a() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 150) break outer;
      const [s0,s1,s2] = ST[si];
      const [r0,r1,r2] = RT[ri];
      const [f0,f1,f2] = FT[(si + ri) % FT.length];
      const sz: Size = ((n % 3) + 1) as Size;
      const cells8 = m(
        f(s0,f0,sz,r0), f(s0,f1,sz,r1), f(s0,f2,sz,r2),
        f(s1,f0,sz,r0), f(s1,f1,sz,r1), f(s1,f2,sz,r2),
        f(s2,f0,sz,r0), f(s2,f1,sz,r1),
      );
      const correct = f(s2, f2, sz, r2);
      // each distractor violates exactly one rule
      const d1 = f(s2, f2, sz, r0); // wrong rotation
      const d2 = f(s2, f0, sz, r2); // wrong fill
      const d3 = f(s1, f2, sz, r2); // wrong shape
      const d4 = f(s2, f1, sz, r1); // wrong fill AND rotation (double wrong)
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `형태: ${SHAPE_KO[s2]}, 채우기: ${FILL_KO[f2]}, 회전: ${r2}° — 3가지 규칙 동시 적용`,
        'matrix3x3', 3));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 3b — Fill × Rotation × Size  (100q)
// Rule 1: fill(row)  / Rule 2: rotation(col)  / Rule 3: size = diagSz
// ══════════════════════════════════════════════════════════════════════════════
(function genL3b() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 100) break outer;
      const shape = SHAPES[shi];
      const [r0,r1,r2] = RT[ri];
      const [f0,f1,f2] = FT[(shi + ri) % FT.length];
      const cells8 = m(
        f(shape,f0,diagSz(0,0),r0), f(shape,f0,diagSz(0,1),r1), f(shape,f0,diagSz(0,2),r2),
        f(shape,f1,diagSz(1,0),r0), f(shape,f1,diagSz(1,1),r1), f(shape,f1,diagSz(1,2),r2),
        f(shape,f2,diagSz(2,0),r0), f(shape,f2,diagSz(2,1),r1),
      );
      const csz = diagSz(2,2);
      const correct = f(shape, f2, csz, r2);
      const d1 = f(shape, f2, csz, r0);              // wrong rotation
      const altSz: Size = csz === 2 ? 3 : 2;
      const d2 = f(shape, f2, altSz, r2);             // wrong size
      const d3 = f(shape, f0, csz, r2);               // wrong fill (row 0)
      const d4 = f(shape, f1, csz, r2);               // wrong fill (row 1)
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `채우기: ${FILL_KO[f2]}, 회전: ${r2}°, 크기: ${csz}`,
        'matrix3x3', 3));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 4 — Shape × Fill × Size × Rotation  (100q)  ★ 멘사 코리아 수준
// All four attributes follow independent rules simultaneously
// Each distractor violates exactly ONE rule — maximum deception
// ══════════════════════════════════════════════════════════════════════════════
(function genL4() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 100) break outer;
      const [s0,s1,s2] = ST[si];
      const [r0,r1,r2] = RT[ri];
      const [f0,f1,f2] = FT[(si + ri) % FT.length];
      const cells8 = m(
        f(s0,f0,diagSz(0,0),r0), f(s0,f1,diagSz(0,1),r1), f(s0,f2,diagSz(0,2),r2),
        f(s1,f0,diagSz(1,0),r0), f(s1,f1,diagSz(1,1),r1), f(s1,f2,diagSz(1,2),r2),
        f(s2,f0,diagSz(2,0),r0), f(s2,f1,diagSz(2,1),r1),
      );
      const csz = diagSz(2,2);
      const correct = f(s2, f2, csz, r2);
      // Each distractor wrong in exactly ONE dimension
      const altSz: Size = csz === 2 ? 1 : (csz === 1 ? 3 : 1);
      const d1 = f(s2, f2, csz,    r0);  // wrong rotation only
      const d2 = f(s2, f2, altSz,  r2);  // wrong size only
      const d3 = f(s2, f0, csz,    r2);  // wrong fill only
      const d4 = f(s1, f2, csz,    r2);  // wrong shape only
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `4가지 규칙: 형태(행)=${SHAPE_KO[s2]}, 채우기(열)=${FILL_KO[f2]}, 크기(대각)=${csz}, 회전(열)=${r2}°`,
        'matrix3x3', 4));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL 5 — Rotation Cycle + Count + Shape  (50q)  ★ 노르웨이 멘사 수준
// Row: shape  /  Col: rotation cycling (cyclic shift by row)  /  Count cycling
// Element at (r,c): shape=S[r], fill=F[col], rotation=RT[(r+c)%3], count=c+1
// ══════════════════════════════════════════════════════════════════════════════
(function genL5() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let fi = 0; fi < FT.length; fi++) {
      if (n >= 50) break outer;
      const [s0,s1,s2] = ST[si];
      const [f0,f1,f2] = FT[fi];
      const ri = (si + fi) % RT.length;
      const [r0,r1,r2] = RT[ri];
      // rotation at (row,col) = RT[(row+col)%3], i.e. r0/r1/r2 cycling
      const rot = (row: number, col: number) => [r0,r1,r2][(row+col)%3];
      const cells8 = m(
        f(s0,f0,2,rot(0,0),1), f(s0,f1,2,rot(0,1),2), f(s0,f2,2,rot(0,2),3),
        f(s1,f0,2,rot(1,0),1), f(s1,f1,2,rot(1,1),2), f(s1,f2,2,rot(1,2),3),
        f(s2,f0,2,rot(2,0),1), f(s2,f1,2,rot(2,1),2),
      );
      // (2,2): count=3, rotation=rot(2,2)=r1
      const correct = f(s2, f2, 2, rot(2,2), 3);
      const d1 = f(s2, f2, 2, r0, 3);        // wrong rotation (r0 instead of r1)
      const d2 = f(s2, f2, 2, r2, 3);        // wrong rotation (r2 instead of r1)
      const d3 = f(s2, f2, 2, rot(2,2), 2);  // wrong count (2 instead of 3)
      const d4 = f(s2, f0, 2, rot(2,2), 3);  // wrong fill
      QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
        `순환 회전 패턴: 각 위치의 회전각 = (행+열)%3번째 각도. 개수=열+1. 정답: ${SHAPE_KO[s2]}, ${FILL_KO[f2]}, 회전${rot(2,2)}°, 개수3`,
        'matrix3x3', 5));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L2 — Rotation sequence  (50q)
// Each element of the series rotates by a fixed delta
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL2() {
  let n = 0;
  outer: for (let si = 0; si < ST.length; si++) {
    for (let ri = 0; ri < RT.length; ri++) {
      if (n >= 50) break outer;
      const [s0] = ST[si];
      const [r0,r1,r2] = RT[ri];
      const fill: Fill = FILLS[(si + ri) % 4];
      const sz: Size = ((n % 3) + 1) as Size;
      const dr = ((r1 - r0) + 360) % 360;
      const r3 = (r2 + dr) % 360;
      const cells = [f(s0,fill,sz,r0), f(s0,fill,sz,r1), f(s0,fill,sz,r2)];
      const correct = f(s0, fill, sz, r3);
      const d1 = f(s0, fill, sz, r0);                              // wrapped back (wrong)
      const d2 = f(s0, fill, sz, (r2 - dr + 360) % 360);          // one step back
      const d3 = f(ST[(si+1)%ST.length][0], fill, sz, r3);        // right rotation, wrong shape
      const d4 = f(s0, FILLS[(FILLS.indexOf(fill)+1)%4], sz, r3); // right rotation, wrong fill
      QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
        `매 단계 ${dr}° 회전. 다음은 ${r3}°`,
        'series', 2));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L3 — Fill + Rotation dual cycle  (30q)
// Each step: fill cycles AND rotation increases 90°
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL3() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      if (n >= 30) break outer;
      const shape = SHAPES[shi];
      const fills: Fill[] = [
        FILLS[fi % 4], FILLS[(fi+1) % 4], FILLS[(fi+2) % 4],
      ];
      const correctFill: Fill = FILLS[(fi+3) % 4];
      const cells = [
        f(shape, fills[0], 2, 0),
        f(shape, fills[1], 2, 90),
        f(shape, fills[2], 2, 180),
      ];
      const correct = f(shape, correctFill, 2, 270);
      const d1 = f(shape, correctFill, 2, 0);              // right fill, wrong rotation
      const d2 = f(shape, fills[0], 2, 270);               // right rotation, wrong fill
      const d3 = f(shape, correctFill, 2, 90);             // right fill, wrong rotation
      const d4 = f(SHAPES[(shi+1)%8], correctFill, 2, 270); // right fill+rot, wrong shape
      QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
        `채우기: ${FILL_KO[fills[0]]}→${FILL_KO[fills[1]]}→${FILL_KO[fills[2]]}→${FILL_KO[correctFill]}, 회전: 0→90→180→270°`,
        'series', 3));
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// SERIES L4 — Shape + Fill + Size triple change  (20q)
// Each step: shape cycles, fill cycles, size 1→2→3→1
// ══════════════════════════════════════════════════════════════════════════════
(function genSeriesL4() {
  let n = 0;
  for (let si = 0; si < ST.length && n < 20; si++) {
    const [s0,s1,s2] = ST[si];
    const s3: Shape = SHAPES[(SHAPES.indexOf(s0)+3) % 8];
    const fi = si % FT.length;
    const [f0,f1,f2] = FT[fi];
    const f3: Fill = FILLS[(FILLS.indexOf(f0)+3)%4];
    const cells = [
      f(s0, f0, 1, 0),
      f(s1, f1, 2, 0),
      f(s2, f2, 3, 0),
    ];
    const correct = f(s3, f3, 1, 0); // size wraps back to 1
    const d1 = f(s3, f3, 3, 0);      // wrong size (continues instead of wrap)
    const d2 = f(s3, f0, 1, 0);      // wrong fill
    const d3 = f(s0, f3, 1, 0);      // wrong shape
    const d4 = f(s3, f3, 2, 0);      // wrong size
    QUESTIONS.push(makeQ5(qid++, cells, correct, d1, d2, d3, d4,
      `형태·채우기·크기 동시 순환. 크기는 1→2→3→1 반복. 다음: ${SHAPE_KO[s3]}, ${FILL_KO[f3]}, 크기1`,
      'series', 4));
    n++;
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Shape different  (5 items, 1 odd shape)  (60q)
// ══════════════════════════════════════════════════════════════════════════════
(function genOddShape() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      for (let sz = 1; sz <= 3 && n < 60; sz++) {
        if (n >= 60) break outer;
        const shape = SHAPES[shi];
        const fill = FILLS[fi];
        const s = sz as Size;
        const oddShape: Shape = SHAPES[(shi + 1 + n % 6) % SHAPES.length];
        const oddPos = n % 5;
        const items: Fig[] = [
          f(shape,fill,s), f(shape,fill,s), f(shape,fill,s),
          f(shape,fill,s), f(shape,fill,s),
        ];
        items[oddPos] = f(oddShape, fill, s);
        QUESTIONS.push({
          id: qid++, type: 'oddOneOut', cells: items,
          options: items as [Fig,Fig,Fig,Fig,Fig],
          answer: oddPos, difficulty: 2,
          explanation: `나머지 4개는 ${SHAPE_KO[shape]}이지만 ${oddPos+1}번은 ${SHAPE_KO[oddShape]}입니다.`,
        });
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Fill different  (60q)
// ══════════════════════════════════════════════════════════════════════════════
(function genOddFill() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      for (let sz = 1; sz <= 3 && n < 60; sz++) {
        if (n >= 60) break outer;
        const shape = SHAPES[shi];
        const fill = FILLS[fi];
        const oddFill: Fill = FILLS[(fi + 1 + n % 3) % 4];
        const s = sz as Size;
        const oddPos = n % 5;
        const items: Fig[] = [
          f(shape,fill,s), f(shape,fill,s), f(shape,fill,s),
          f(shape,fill,s), f(shape,fill,s),
        ];
        items[oddPos] = f(shape, oddFill, s);
        QUESTIONS.push({
          id: qid++, type: 'oddOneOut', cells: items,
          options: items as [Fig,Fig,Fig,Fig,Fig],
          answer: oddPos, difficulty: 2,
          explanation: `나머지 4개는 ${FILL_KO[fill]} 채우기이지만 ${oddPos+1}번은 ${FILL_KO[oddFill]} 채우기입니다.`,
        });
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Rotation different  (50q)  난이도 3
// ══════════════════════════════════════════════════════════════════════════════
(function genOddRotation() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length; fi++) {
      for (let rot = 0; rot < ROTS.length && n < 50; rot++) {
        if (n >= 50) break outer;
        const shape = SHAPES[shi];
        const fill = FILLS[fi];
        const mainRot = ROTS[rot];
        const oddRot = ROTS[(rot + 2) % ROTS.length];
        const sz: Size = ((n % 3) + 1) as Size;
        const oddPos = n % 5;
        const items: Fig[] = [
          f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot),
          f(shape,fill,sz,mainRot), f(shape,fill,sz,mainRot),
        ];
        items[oddPos] = f(shape, fill, sz, oddRot);
        QUESTIONS.push({
          id: qid++, type: 'oddOneOut', cells: items,
          options: items as [Fig,Fig,Fig,Fig,Fig],
          answer: oddPos, difficulty: 3,
          explanation: `나머지 4개는 ${mainRot}° 방향이지만 ${oddPos+1}번은 ${oddRot}° 방향입니다.`,
        });
        n++;
      }
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// ODD ONE OUT — Size different  (30q)
// ══════════════════════════════════════════════════════════════════════════════
(function genOddSize() {
  let n = 0;
  outer: for (let shi = 0; shi < SHAPES.length; shi++) {
    for (let fi = 0; fi < FILLS.length && n < 30; fi++) {
      if (n >= 30) break outer;
      const shape = SHAPES[shi];
      const fill = FILLS[fi];
      const mainSz: Size = ((n % 2) + 1) as Size;
      const oddSz: Size = mainSz === 1 ? 3 : 1;
      const oddPos = n % 5;
      const items: Fig[] = [
        f(shape,fill,mainSz), f(shape,fill,mainSz), f(shape,fill,mainSz),
        f(shape,fill,mainSz), f(shape,fill,mainSz),
      ];
      items[oddPos] = f(shape, fill, oddSz);
      QUESTIONS.push({
        id: qid++, type: 'oddOneOut', cells: items,
        options: items as [Fig,Fig,Fig,Fig,Fig],
        answer: oddPos, difficulty: 2,
        explanation: `나머지 4개는 크기 ${mainSz}이지만 ${oddPos+1}번은 크기 ${oddSz}입니다.`,
      });
      n++;
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
// FILLER — extra L1/L2 variants to reach 1000
// ══════════════════════════════════════════════════════════════════════════════
(function genFiller() {
  const needed = 1000 - QUESTIONS.length;
  if (needed <= 0) return;
  let n = 0;
  outer: for (let ri = 0; ri < RT.length; ri++) {
    for (let si = 0; si < ST.length; si++) {
      for (let fi = 0; fi < FT.length; fi++) {
        if (n >= needed) break outer;
        const [s0,s1,s2] = ST[si];
        const [r0,r1,r2] = RT[ri];
        const [f0,f1,f2] = FT[fi];
        const sz: Size = ((n % 3) + 1) as Size;
        const cells8 = m(
          f(s0,f0,sz,r0), f(s0,f1,sz,r1), f(s0,f2,sz,r2),
          f(s1,f0,sz,r0), f(s1,f1,sz,r1), f(s1,f2,sz,r2),
          f(s2,f0,sz,r0), f(s2,f1,sz,r1),
        );
        const correct = f(s2, f2, sz, r2);
        const d1 = f(s2, f2, sz, r0);
        const d2 = f(s2, f0, sz, r2);
        const d3 = f(s1, f2, sz, r2);
        const d4 = f(s2, f1, sz, r1);
        const diff: FRTQuestion['difficulty'] = n < needed * 0.4 ? 3 : 4;
        QUESTIONS.push(makeQ5(qid++, cells8, correct, d1, d2, d3, d4,
          `형태: ${SHAPE_KO[s2]}, 채우기: ${FILL_KO[f2]}, 회전: ${r2}°`,
          'matrix3x3', diff));
        n++;
      }
    }
  }
})();

export const ALL_FRT_QUESTIONS: FRTQuestion[] = QUESTIONS.slice(0, 1000);
