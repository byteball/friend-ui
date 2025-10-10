"use no memo";

import Image, { ImageProps } from "next/image";
import { CSSProperties, FC, useMemo } from "react";

type PuzzleImageProps = ImageProps & {
  rows?: number;
  columns?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  filledCeils?: number;
  // knob size as a fraction of min(cellW, cellH)
  knobScale?: number; // 0.15..0.45 typical
  // how wide along the edge the knob spans (as fraction of cell edge length)
  knobWidthScale?: number; // 0.4..0.8 typical (default 0.65 for wider, puzzle-like)
  // how round the knob is (controls bezier tangents along the edge)
  knobCurveTension?: number; // 0.2..0.7 typical (default 0.5 for rounder)
  // multiplier for vertical/horizontal bulge of the knob (only height of bulge, not width)
  bulgeFactor?: number; // 0..1 (default 0.6 for subtler bulge)
  // opacity of the overlay
  overlayOpacity?: number; // 0..1
  // whether to show the rectangular border as well
  showBorder?: boolean;
  // pointer-events for overlay, default 'none' to not block interactions
  overlayPointerEvents?: CSSProperties["pointerEvents"];
  // small randomness near outer rectangle corners (relative to cell size)
  cornerJitter?: number; // 0..0.1 typical (default 0.02)
  // optional seed for deterministic randomness; when omitted, derived from rows/cols/knobScale
  randomSeed?: number;
  // place the puzzle knobs at random positions along each edge (deterministic given seed)
  randomizeKnobPosition?: boolean;
  // bounds for the random knob center along edge [0..1]; should satisfy 0 <= min < max <= 1
  knobCenterMin?: number;
  knobCenterMax?: number;
};

// const filledCeils = 4;

// Generate a simple jigsaw-like edge path between two points (horizontal or vertical)
function edgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  knobDir: 1 | -1, // direction perpendicular to the edge: 1 => positive (down/right), -1 => negative (up/left)
  isHorizontal: boolean,
  knobR: number,
  bulgeFactor: number,
  knobCenterT: number, // 0..1, relative position along edge where the knob bulge is centered
  knobWidthScale?: number,
  knobCurveTension?: number
) {
  // Straight edge (no knob) when knobR <= 0 or length too small
  if (knobR <= 0) return `M ${x1} ${y1} L ${x2} ${y2}`;

  if (isHorizontal) {
    const y = y1; // y1 === y2
    const len = Math.abs(x2 - x1);
    const xMin = Math.min(x1, x2);
    // center along the horizontal edge independent of direction
    const center = xMin + len * Math.max(0, Math.min(knobCenterT, 1));
    const wScale = Math.max(0.2, Math.min(knobWidthScale ?? 0.65, 0.9));
    const knobW = Math.min(len * wScale, knobR * 2.8);
    const s1 = center - knobW / 2;
    const s2 = center + knobW / 2;
    const c = knobW * Math.max(0.15, Math.min(knobCurveTension ?? 0.5, 0.85)); // control offset along x
    const r = knobR * Math.max(0, Math.min(bulgeFactor, 1)); // control offset along y (reduced by bulgeFactor)
    return [
      `M ${x1} ${y}`,
      `L ${s1} ${y}`,
      // up/down bulge using two cubic beziers
      `C ${s1 + c} ${y} ${center - c} ${y + knobDir * r} ${center} ${y + knobDir * r}`,
      `C ${center + c} ${y + knobDir * r} ${s2 - c} ${y} ${s2} ${y}`,
      `L ${x2} ${y}`,
    ].join(" ");
  } else {
    const x = x1; // x1 === x2
    const len = Math.abs(y2 - y1);
    const yMin = Math.min(y1, y2);
    // center along the vertical edge independent of direction
    const center = yMin + len * Math.max(0, Math.min(knobCenterT, 1));
    const wScale = Math.max(0.2, Math.min(knobWidthScale ?? 0.65, 0.9));
    const knobH = Math.min(len * wScale, knobR * 2.8);
    const t1 = center - knobH / 2;
    const t2 = center + knobH / 2;
    const c = knobH * Math.max(0.15, Math.min(knobCurveTension ?? 0.5, 0.85)); // control offset along y
    const r = knobR * Math.max(0, Math.min(bulgeFactor, 1)); // control offset along x (reduced by bulgeFactor)
    return [
      `M ${x} ${y1}`,
      `L ${x} ${t1}`,
      `C ${x} ${t1 + c} ${x + knobDir * r} ${center - c} ${x + knobDir * r} ${center}`,
      `C ${x + knobDir * r} ${center + c} ${x} ${t2 - c} ${x} ${t2}`,
      `L ${x} ${y2}`,
    ].join(" ");
  }
}

// Edge path commands without initial MoveTo, suitable for continuing a path
function edgePathCommands(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  knobDir: 1 | -1,
  isHorizontal: boolean,
  knobR: number,
  bulgeFactor: number,
  knobCenterT: number,
  knobWidthScale?: number,
  knobCurveTension?: number
) {
  if (knobR <= 0) return [`L ${x2} ${y2}`];

  if (isHorizontal) {
    const y = y1;
    const len = Math.abs(x2 - x1);
    const xMin = Math.min(x1, x2);
    const center = xMin + len * Math.max(0, Math.min(knobCenterT, 1));
    const wScale = Math.max(0.2, Math.min(knobWidthScale ?? 0.65, 0.9));
    const knobW = Math.min(len * wScale, knobR * 2.8);
    const s1 = center - knobW / 2;
    const s2 = center + knobW / 2;
    const c = knobW * Math.max(0.15, Math.min(knobCurveTension ?? 0.5, 0.85));
    const r = knobR * Math.max(0, Math.min(bulgeFactor, 1));
    if (x1 <= x2) {
      // left to right
      return [
        `L ${s1} ${y}`,
        `C ${s1 + c} ${y} ${center - c} ${y + knobDir * r} ${center} ${y + knobDir * r}`,
        `C ${center + c} ${y + knobDir * r} ${s2 - c} ${y} ${s2} ${y}`,
        `L ${x2} ${y}`,
      ];
    } else {
      // right to left: mirror sequence
      return [
        `L ${s2} ${y}`,
        `C ${s2 - c} ${y} ${center + c} ${y + knobDir * r} ${center} ${y + knobDir * r}`,
        `C ${center - c} ${y + knobDir * r} ${s1 + c} ${y} ${s1} ${y}`,
        `L ${x2} ${y}`,
      ];
    }
  } else {
    const x = x1;
    const len = Math.abs(y2 - y1);
    const yMin = Math.min(y1, y2);
    const center = yMin + len * Math.max(0, Math.min(knobCenterT, 1));
    const wScale = Math.max(0.2, Math.min(knobWidthScale ?? 0.65, 0.9));
    const knobH = Math.min(len * wScale, knobR * 2.8);
    const t1 = center - knobH / 2;
    const t2 = center + knobH / 2;
    const c = knobH * Math.max(0.15, Math.min(knobCurveTension ?? 0.5, 0.85));
    const r = knobR * Math.max(0, Math.min(bulgeFactor, 1));
    if (y1 <= y2) {
      // top to bottom
      return [
        `L ${x} ${t1}`,
        `C ${x} ${t1 + c} ${x + knobDir * r} ${center - c} ${x + knobDir * r} ${center}`,
        `C ${x + knobDir * r} ${center + c} ${x} ${t2 - c} ${x} ${t2}`,
        `L ${x} ${y2}`,
      ];
    } else {
      // bottom to top: mirror sequence
      return [
        `L ${x} ${t2}`,
        `C ${x} ${t2 - c} ${x + knobDir * r} ${center + c} ${x + knobDir * r} ${center}`,
        `C ${x + knobDir * r} ${center - c} ${x} ${t1 + c} ${x} ${t1}`,
        `L ${x} ${y2}`,
      ];
    }
  }
}
// Simple deterministic RNG (LCG)
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function buildPuzzlePaths(
  rows: number,
  cols: number,
  knobScale: number,
  bulgeFactor: number,
  cornerJitter: number,
  seed: number,
  randomizeKnobPosition: boolean,
  knobCenterMin: number,
  knobCenterMax: number,
  knobWidthScale?: number,
  knobCurveTension?: number
) {
  // We build in a normalized coordinate system where cell = 100x100 units
  const cellW = 100;
  const cellH = 100;
  const width = cols * cellW;
  const height = rows * cellH;
  const knobR = Math.min(cellW, cellH) * Math.max(0, Math.min(knobScale, 0.5));
  const rng = makeRng(seed || 1);
  // clamp helper
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
  const cMin = clamp(isFinite(knobCenterMin) ? knobCenterMin : 0.3, 0, 1);
  const cMax = clamp(isFinite(knobCenterMax) ? knobCenterMax : 0.7, 0, 1);
  const [minT, maxT] = cMin < cMax ? [cMin, cMax] : [cMax, cMin];

  const parts: string[] = [];
  // store knob centers for internal edges to reconstruct piece shapes
  const horizCenters: number[][] = Array.from({ length: Math.max(0, rows - 1) }, () => Array(cols).fill(0.5));
  const vertCenters: number[][] = Array.from({ length: Math.max(0, cols - 1) }, () => Array(rows).fill(0.5));
  const horizDirs: (1 | -1)[][] = Array.from({ length: Math.max(0, rows - 1) }, () => Array(cols).fill(1));
  const vertDirs: (1 | -1)[][] = Array.from({ length: Math.max(0, cols - 1) }, () => Array(rows).fill(1));

  // Outer border - simple rectangle without rounded corners
  const topLeft = { x: 0, y: 0 };
  const topRight = { x: width, y: 0 };
  const bottomRight = { x: width, y: height };
  const bottomLeft = { x: 0, y: height };

  // Construct path: simple rectangle
  parts.push(
    [
      `M ${topLeft.x} ${topLeft.y}`,
      `L ${topRight.x} ${topRight.y}`,
      `L ${bottomRight.x} ${bottomRight.y}`,
      `L ${bottomLeft.x} ${bottomLeft.y}`,
      `Z`,
    ].join(" ")
  );

  // Horizontal internal edges with knobs
  for (let i = 1; i < rows; i++) {
    const y = i * cellH;
    for (let j = 0; j < cols; j++) {
      const x1 = j * cellW;
      const x2 = (j + 1) * cellW;
      // Alternate knob direction up/down in a checker pattern
      const dir: 1 | -1 = (i + j) % 2 === 0 ? 1 : -1; // 1 = down, -1 = up (SVG y grows downward)
      const centerT = randomizeKnobPosition ? (minT + (maxT - minT) * rng()) : 0.5;
      // store center & dir for this horizontal edge: index row i-1, col j
      if (horizCenters[i - 1]) {
        horizCenters[i - 1][j] = centerT;
        horizDirs[i - 1][j] = dir;
      }
      parts.push(edgePath(x1, y, x2, y, dir, true, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
    }
  }

  // Vertical internal edges with knobs
  for (let j = 1; j < cols; j++) {
    const x = j * cellW;
    for (let i = 0; i < rows; i++) {
      const y1 = i * cellH;
      const y2 = (i + 1) * cellH;
      // Alternate knob direction left/right in a checker pattern
      const dir: 1 | -1 = (i + j) % 2 === 0 ? 1 : -1; // 1 = right, -1 = left
      const centerT = randomizeKnobPosition ? (minT + (maxT - minT) * rng()) : 0.5;
      // store center & dir for this vertical edge: index col j-1, row i
      if (vertCenters[j - 1]) {
        vertCenters[j - 1][i] = centerT;
        vertDirs[j - 1][i] = dir;
      }
      parts.push(edgePath(x, y1, x, y2, dir, false, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
    }
  }

  return { d: parts.join(" "), viewBox: `0 0 ${width} ${height}`, width, height, cellW, cellH, horizCenters, vertCenters, horizDirs, vertDirs };
}

export const PuzzleImage: FC<PuzzleImageProps> = ({
  rows = 3,
  columns = 3,

  stroke = "#ffffff",
  filledCeils = 5,
  strokeWidth = 1.9,
  className,
  bulgeFactor = 0.45,
  overlayOpacity = 0.9,
  showBorder = true,
  overlayPointerEvents = "none",
  cornerJitter = 0.02,
  randomSeed,
  randomizeKnobPosition = true,

  knobScale = 0.55,
  knobWidthScale = 0.55,
  knobCurveTension = 0.7,
  knobCenterMin = 0.3,
  knobCenterMax = 0.7,

  ...imgProps
}) => {
  // width, height,
  const { d, viewBox, cellW, cellH, horizCenters, vertCenters, horizDirs, vertDirs } = useMemo(
    () => {
      // derive a deterministic seed when not provided to avoid SSR/CSR mismatch
      const derivedSeed =
        randomSeed ??
        ((rows * 73856093) ^ (columns * 19349663) ^ Math.floor(knobScale * 1e6)) >>> 0;
      return buildPuzzlePaths(
        rows,
        columns,
        knobScale,
        bulgeFactor,
        cornerJitter,
        derivedSeed,
        !!randomizeKnobPosition,
        knobCenterMin,
        knobCenterMax,
        knobWidthScale,
        knobCurveTension
      );
    },
    [
      rows,
      columns,
      knobScale,
      knobWidthScale,
      knobCurveTension,
      bulgeFactor,
      cornerJitter,
      randomSeed,
      randomizeKnobPosition,
      knobCenterMin,
      knobCenterMax,
    ]
  );

  // Build piece-shaped paths (including knobs) for the first N cells (row-major)
  const filledPiecePaths = useMemo(() => {
    const total = rows * columns;
    const count = Math.max(0, Math.min(filledCeils, total));
    const paths: string[] = [];

    const knobR = Math.min(cellW, cellH) * Math.max(0, Math.min(knobScale, 0.5));

    for (let k = 0; k < count; k++) {
      // fill from the end: bottom-right backwards in row-major order
      const lin = total - 1 - k;
      const r = Math.floor(lin / columns);
      const c = lin % columns;
      const x0 = c * cellW;
      const y0 = r * cellH;
      const x1 = (c + 1) * cellW;
      const y1b = (r + 1) * cellH;

      const segs: string[] = [];
      // Start at top-left of the cell
      segs.push(`M ${x0} ${y0}`);

      // Top edge (left to right)
      if (r === 0) {
        segs.push(...edgePathCommands(x0, y0, x1, y0, 1, true, 0, bulgeFactor, 0.5, knobWidthScale, knobCurveTension));
      } else {
        const i = r; // horizontal edge index above
        const dir: 1 | -1 = (horizDirs[i - 1] && horizDirs[i - 1][c]) ?? 1;
        const centerT = (horizCenters[i - 1] && horizCenters[i - 1][c]) ?? 0.5;
        segs.push(...edgePathCommands(x0, y0, x1, y0, dir, true, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
      }

      // Right edge (top to bottom)
      if (c === columns - 1) {
        segs.push(...edgePathCommands(x1, y0, x1, y1b, 1, false, 0, bulgeFactor, 0.5, knobWidthScale, knobCurveTension));
      } else {
        const j = c + 1; // vertical edge on the right
        const dir: 1 | -1 = (vertDirs[j - 1] && vertDirs[j - 1][r]) ?? 1;
        const centerT = (vertCenters[j - 1] && vertCenters[j - 1][r]) ?? 0.5;
        segs.push(...edgePathCommands(x1, y0, x1, y1b, dir, false, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
      }

      // Bottom edge (right to left)
      if (r === rows - 1) {
        segs.push(...edgePathCommands(x1, y1b, x0, y1b, 1, true, 0, bulgeFactor, 0.5, knobWidthScale, knobCurveTension));
      } else {
        const i2 = r + 1; // horizontal edge below
        const dir: 1 | -1 = (horizDirs[i2 - 1] && horizDirs[i2 - 1][c]) ?? 1;
        const centerT = (horizCenters[i2 - 1] && horizCenters[i2 - 1][c]) ?? 0.5;
        segs.push(...edgePathCommands(x1, y1b, x0, y1b, dir, true, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
      }

      // Left edge (bottom to top)
      if (c === 0) {
        segs.push(...edgePathCommands(x0, y1b, x0, y0, 1, false, 0, bulgeFactor, 0.5, knobWidthScale, knobCurveTension));
      } else {
        const j2 = c; // vertical edge on the left
        const dir: 1 | -1 = (vertDirs[j2 - 1] && vertDirs[j2 - 1][r]) ?? 1;
        const centerT = (vertCenters[j2 - 1] && vertCenters[j2 - 1][r]) ?? 0.5;
        segs.push(...edgePathCommands(x0, y1b, x0, y0, dir, false, knobR, bulgeFactor, centerT, knobWidthScale, knobCurveTension));
      }

      const path = `${segs.join(" ")} Z`;
      paths.push(path);
    }
    return paths;
  }, [rows, columns, cellW, cellH, horizCenters, vertCenters, knobScale, bulgeFactor, filledCeils, knobWidthScale, knobCurveTension, horizDirs, vertDirs]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block", userSelect: "none" }}>
      {/* Base image */}
      <Image {...imgProps} alt="ghost" className="w-full h-full" draggable={false} style={{ ...(imgProps.style || {}), display: "block" }} />

      {/* SVG overlay */}
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: overlayPointerEvents,
        }}
        fill="none"
      >
        <defs>
          <filter id="grayscale-filter">
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {/* Grayscale (black and white) fill for first N pieces (including knobs) */}
        <g fill="#ffffff" opacity={1} style={{ mixBlendMode: "saturation" }}>
          {filledPiecePaths.map((p, idx) => (
            <path key={idx} d={p} />
          ))}
        </g>
        {/* White overlay with 30% opacity for filled pieces */}
        <g fill="#ffffff" opacity={0.3}>
          {filledPiecePaths.map((p, idx) => (
            <path key={`white-overlay-${idx}`} d={p} />
          ))}
        </g>
        {/* Optional subtle shadow for contrast */}
        <path
          d={d}
          stroke="#000000"
          strokeOpacity={0.35}
          strokeWidth={strokeWidth + 1}
        />
        <path
          d={showBorder ? d : d}
          stroke={stroke}
          strokeOpacity={overlayOpacity}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
};