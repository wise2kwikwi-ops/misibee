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
  cells: Fig[];              // 8 cells for matrix3x3 (9th is answer), 4 for series
  options: [Fig, Fig, Fig, Fig];
  answer: number;            // 0-3
  explanation: string;
}
