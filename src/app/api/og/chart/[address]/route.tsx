import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { appConfig } from "@/app-config";
import { buildTotalBalanceSeries } from "@/features/profile/domain/build-total-balance-series";
import { toLocalString } from "@/lib/to-local-string";
import { minBy } from "lodash";


export const dynamic = "force-dynamic"; // Avoid caching during development

const CHART_DIMENSIONS = {
  width: 1100,
  height: 380,
  margin: { top: 30, right: 16, bottom: 40, left: 130 },
} as const;

type BalancePoint = {
  totalBalance: number;
  trigger_date: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type ChartPoint = { x: number; y: number };

const buildLinePath = (points: ChartPoint[]) => {
  if (points.length === 0) {
    return "M0 0";
  }

  // Build straight line path (no smoothing, no fill)
  return points
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
};

const generateChartSvg = (
  data: BalancePoint[],
  minimumBalanceValue: number,
  decimals: number,
  symbol: string
) => {
  const { width, height, margin } = CHART_DIMENSIONS;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const baselineY = margin.top + innerHeight;

  if (!data.length) {
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" rx="16" fill="rgba(20, 71, 229, 0.06)" />
        <text x="50%" y="50%" fill="#6b7280" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">
          No balance history yet
        </text>
      </svg>
    `;
  }

  const normalizedSeries = data.map((point) => ({
    ...point,
    normalizedBalance: Math.max(0, point.totalBalance - minimumBalanceValue),
  }));

  const maxValue = normalizedSeries.reduce(
    (max, point) => Math.max(max, point.normalizedBalance),
    Number.NEGATIVE_INFINITY
  );

  // Calculate actual range - if it's too small, use a minimum range for visibility
  const actualRange = maxValue;
  const minRange = maxValue * 0.1; // Use 10% of max as minimum range for visibility
  const valueRange = Math.max(minRange, actualRange);

  // Use valueRange or 1 for safe calculations
  const safeRange = valueRange === 0 ? 1 : valueRange;

  // If all values are the same (range is 0), offset them to show in the middle of the chart
  const isConstantValue = actualRange === 0;
  const displayNormalizedSeries = isConstantValue
    ? normalizedSeries.map(point => ({ ...point, normalizedBalance: 0.5 }))
    : normalizedSeries; const xPositions = displayNormalizedSeries.map((_, index) => {
      if (displayNormalizedSeries.length === 1) {
        return margin.left + innerWidth / 2;
      }

      const paddingRatio = 1 / (displayNormalizedSeries.length + 1);
      const horizontalPadding = innerWidth * paddingRatio;
      const availableWidth = innerWidth - horizontalPadding * 2;

      return margin.left + horizontalPadding + (index / (displayNormalizedSeries.length - 1)) * availableWidth;
    });

  const points = displayNormalizedSeries.map((point, index) => {
    const y = margin.top + (1 - point.normalizedBalance / safeRange) * innerHeight;
    return {
      x: xPositions[index],
      y,
      date: point.trigger_date,
    };
  });

  const areaPath = buildLinePath(points);

  const GRID_LINE_COUNT = 4;

  const gridLines = Array.from({ length: GRID_LINE_COUNT }).map((_, index) => {
    const ratio = index / (GRID_LINE_COUNT - 1);
    const y = margin.top + ratio * innerHeight;
    return `<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${width - margin.right}" y2="${y.toFixed(2)}" stroke="rgba(107, 114, 128, 0.15)" stroke-width="1" />`;
  });

  const yAxisLabels = Array.from({ length: GRID_LINE_COUNT }).map((_, index) => {
    const ratio = index / (GRID_LINE_COUNT - 1);
    // When all values are equal, show the actual value at all label positions
    const displayValue = isConstantValue ? minimumBalanceValue : (1 - ratio) * valueRange + minimumBalanceValue;
    const roundedValue = Number.isFinite(displayValue)
      ? Number(displayValue.toPrecision(3))
      : 0;
    const formattedValue = toLocalString(roundedValue);
    const y = margin.top + ratio * innerHeight;
    const label = `${formattedValue} ${symbol}`.trim();
    return `<text x="${margin.left - 12}" y="${(y + 4).toFixed(2)}" font-family="Arial, sans-serif" font-size="16" fill="#4b5563" text-anchor="end" dominant-baseline="central">${label}</text>`;
  });

  const tickCount = Math.min(4, displayNormalizedSeries.length);
  const tickIndexes = new Set<number>();

  if (tickCount === displayNormalizedSeries.length) {
    displayNormalizedSeries.forEach((_, index) => tickIndexes.add(index));
  } else {
    tickIndexes.add(0);
    tickIndexes.add(displayNormalizedSeries.length - 1);

    if (displayNormalizedSeries.length > 2) {
      const step = (displayNormalizedSeries.length - 1) / (tickCount - 1);
      for (let i = 1; i < tickCount - 1; i += 1) {
        tickIndexes.add(Math.round(i * step));
      }
    }
  }

  const ticks = Array.from(tickIndexes)
    .sort((a, b) => a - b)
    .map((index) => {
      const { x, date } = points[index];
      const label = dateFormatter.format(new Date(date));
      return `
        <g transform="translate(${x.toFixed(2)}, ${baselineY + 20})">
          <text text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#4b5563">${label}</text>
        </g>
      `;
    });

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="rgba(20, 71, 229, 0.08)" />
      <g>
        <line x1="${margin.left}" y1="${baselineY}" x2="${width - margin.right}" y2="${baselineY}" stroke="#d1d5db" stroke-width="1.5" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${baselineY}" stroke="#d1d5db" stroke-width="1.5" />
      </g>

      <g>
        ${gridLines.join("\n")} 
      </g>

      <g>
        ${yAxisLabels.join("\n")}
      </g>

      <path d="${areaPath}" fill="none" stroke="#1447e5" stroke-width="3" stroke-linejoin="round" />

      <g>
        ${points
      .map(({ x, y }) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4" fill="#1447e5" stroke="#fff" stroke-width="2" />`)
      .join("\n")}
      </g>

      <g>
        ${ticks.join("\n")}
      </g>
    </svg>
  `;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: userAddress } = await params;

  const logoAbsPath = path.join(process.cwd(), "public", "logo.svg");
  const logoFile = readFileSync(logoAbsPath).toString("utf-8");

  const rewardEvents = await fetch(`${appConfig.NOTIFY_URL}/history/${userAddress}`).then(res => res.json()).catch(() => []);

  const frdTokenMeta = __GLOBAL_STORE__?.getOwnToken();
  const decimals = Number(frdTokenMeta?.decimals ?? 9);
  const symbol = frdTokenMeta?.symbol ?? "FRD";

  const balanceSeries = buildTotalBalanceSeries(rewardEvents, decimals);

  const minimumBalanceValue =
    minBy(balanceSeries, (point) => point.totalBalance)?.totalBalance ?? 0;

  const latestTotalBalance = balanceSeries.at(-1)?.totalBalance ?? 0;

  // chart

  const chartSvg = generateChartSvg(balanceSeries, minimumBalanceValue, decimals, symbol);

  try {
    const SVG = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
          </linearGradient>

          <linearGradient id="puzzleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#1d4ed8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
          </linearGradient>

          <filter id="cardShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.1" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bgGradient)" />

        <!-- Logo and Title Group (centered) -->
        <g transform="translate(-15, 10)">
          <!-- Logo -->
          <g transform="translate(315, 35)">
            ${logoFile}
          </g>

          <!-- Title -->
          <text
            x="435"
            y="70"
            font-family="Arial, sans-serif"
            font-size="72"
            font-weight="700"
            fill="#000"
            text-anchor="start"
            dominant-baseline="middle"
          >
            Obyte Friends
          </text>
        </g>

        <g transform="translate(0, 40)">
          <g transform="translate(50, 180)">
            ${chartSvg}
          </g>

          <g transform="translate(0, 0)">
            <!-- Stat label -->
            <text
              x="600"
              y="155"
              font-family="Arial, sans-serif"
              font-size="54"
              font-weight="400"
              fill="#57534d"
              text-anchor="middle"
            >
              My balance: ${toLocalString((latestTotalBalance).toPrecision(4))} ${symbol}
            </text>
          </g>
        </g>
      </svg>
    `;

    const svgBuffer = Buffer.from(SVG);
    const buffer = await sharp(svgBuffer).resize(1200, 630).png().toBuffer();

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}