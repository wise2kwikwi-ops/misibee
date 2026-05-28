export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'cross';
export type Fill = 'solid' | 'empty' | 'striped' | 'dotted';
export type Size = 1 | 2 | 3;

export interface Fig {
  shape: Shape;
  fill: Fill;
  size: Size;
  rotation: number; // degrees: 0, 45, 90, 135, 180, 225, 270, 315
  count: number;    // 1, 2, or 3
}

export interface FRTQuestion {
  id: number;
  type: 'matrix3x3' | 'series' | 'oddOneOut';
  cells: Fig[];
  options: [Fig, Fig, Fig, Fig, Fig]; // 5지선다
  answer: number;                     // 0–4
  difficulty: 1 | 2 | 3 | 4 | 5;    // 1=쉬움 … 5=멘사 최고난도
  explanation: string;
}
