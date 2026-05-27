import React from 'react';
import type { Fig } from '../data/frtTypes';

interface Props {
  fig: Fig | null;
  size?: number;        // cell pixel size (default 60)
  bg?: string;          // cell background color
  highlighted?: boolean;
  isAnswer?: boolean;
}

const CELL = 60;

// ─── Shape path helpers ───────────────────────────────────────────────────────

function pts(...coords: number[]): string {
  const out: string[] = [];
  for (let i = 0; i < coords.length; i += 2) out.push(`${coords[i]},${coords[i+1]}`);
  return out.join(' ');
}

function polyPoints(cx: number, cy: number, r: number, sides: number, startAngle = -Math.PI/2): string {
  const out: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = startAngle + (i * 2 * Math.PI) / sides;
    out.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return out.join(' ');
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points = 5): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    out.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return out.join(' ');
}

// ─── Single figure element renderer ──────────────────────────────────────────

function renderFigElement(fig: Fig, cx: number, cy: number, r: number, patId: string): React.ReactNode[] {
  const elems: React.ReactNode[] = [];

  const strokeProps = {
    stroke: '#1e293b',
    strokeWidth: 1.8,
    strokeLinejoin: 'round' as const,
  };

  let fillAttr = 'none';
  if (fig.fill === 'solid') fillAttr = '#1e293b';
  else if (fig.fill === 'striped') fillAttr = `url(#${patId}-stripe)`;
  else if (fig.fill === 'dotted') fillAttr = `url(#${patId}-dot)`;

  const transform = fig.rotation !== 0 ? `rotate(${fig.rotation} ${cx} ${cy})` : undefined;

  const commonProps = { fill: fillAttr, ...strokeProps, transform };

  switch (fig.shape) {
    case 'circle':
      elems.push(<circle key="s" cx={cx} cy={cy} r={r} {...commonProps} />);
      break;
    case 'square':
      elems.push(<rect key="s" x={cx - r} y={cy - r} width={r * 2} height={r * 2} {...commonProps} />);
      break;
    case 'triangle':
      elems.push(
        <polygon key="s"
          points={pts(cx, cy - r, cx + r * 0.866, cy + r * 0.5, cx - r * 0.866, cy + r * 0.5)}
          {...commonProps}
        />
      );
      break;
    case 'diamond':
      elems.push(
        <polygon key="s"
          points={pts(cx, cy - r, cx + r, cy, cx, cy + r, cx - r, cy)}
          {...commonProps}
        />
      );
      break;
    case 'pentagon':
      elems.push(<polygon key="s" points={polyPoints(cx, cy, r, 5)} {...commonProps} />);
      break;
    case 'hexagon':
      elems.push(<polygon key="s" points={polyPoints(cx, cy, r, 6, 0)} {...commonProps} />);
      break;
    case 'star':
      elems.push(<polygon key="s" points={starPoints(cx, cy, r, r * 0.4)} {...commonProps} />);
      break;
    case 'cross': {
      const w = r * 0.35, l = r;
      elems.push(
        <g key="s" transform={transform}>
          <rect x={cx - w} y={cy - l} width={w * 2} height={l * 2} fill={fillAttr} {...strokeProps} />
          <rect x={cx - l} y={cy - w} width={l * 2} height={w * 2} fill={fillAttr} {...strokeProps} />
        </g>
      );
      return elems;
    }
  }
  return elems;
}

// Arrange multiple copies of the same figure
function arrangePositions(cx: number, cy: number, count: number, r: number): [number, number][] {
  if (count === 1) return [[cx, cy]];
  if (count === 2) return [[cx - r * 0.7, cy], [cx + r * 0.7, cy]];
  return [[cx, cy - r * 0.7], [cx - r * 0.7, cy + r * 0.5], [cx + r * 0.7, cy + r * 0.5]];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FigureCell({ fig, size = CELL, bg, highlighted, isAnswer }: Props) {
  const s = size;
  const cx = s / 2, cy = s / 2;

  if (fig === null || isAnswer) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={0} y={0} width={s} height={s} fill={bg || 'transparent'} rx={4} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={s * 0.4} fill="#94a3b8" fontWeight="bold">?</text>
      </svg>
    );
  }

  const r = (fig.size === 1 ? 0.25 : fig.size === 2 ? 0.35 : 0.42) * s;
  const positions = arrangePositions(cx, cy, fig.count, r * 0.65);
  const patId = `p-${s}-${fig.shape}-${fig.fill}`;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <pattern id={`${patId}-stripe`} x={0} y={0} width={4} height={4} patternUnits="userSpaceOnUse">
          <line x1={0} y1={0} x2={0} y2={4} stroke="#1e293b" strokeWidth={1.5} />
        </pattern>
        <pattern id={`${patId}-dot`} x={0} y={0} width={5} height={5} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={0.9} fill="#1e293b" />
        </pattern>
      </defs>
      <rect x={0} y={0} width={s} height={s} fill={bg || 'transparent'} rx={4} />
      {positions.map(([pcx, pcy], i) =>
        renderFigElement({ ...fig }, pcx, pcy, r * (fig.count > 1 ? 0.7 : 1), patId).map((el, j) =>
          React.cloneElement(el as React.ReactElement, { key: `${i}-${j}` })
        )
      )}
      {highlighted && (
        <rect x={1} y={1} width={s - 2} height={s - 2} fill="none" stroke="#6366f1" strokeWidth={2} rx={4} />
      )}
    </svg>
  );
}
