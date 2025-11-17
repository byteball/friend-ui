import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { appConfig } from "@/app-config";
import { buildRewardSeries } from "@/features/profile/domain/build-reward-series";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { toLocalString } from "@/lib/to-local-string";
import { minBy } from "lodash";


export const dynamic = "force-dynamic"; // Avoid caching during development

const CHART_DIMENSIONS = {
  width: 600,
  height: 400,
  margin: { top: 12, right: 16, bottom: 36, left: 56 },
} as const;

type RewardPoint = {
  rewards: number;
  trigger_date: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const buildAreaPath = (points: Array<{ x: number; y: number }>, baselineY: number) => {
  if (!points.length) {
    return "M0 0";
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const line = points
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  return `${line} L${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
};

const generateChartSvg = (data: RewardPoint[], minimumRewardValue: number) => {
  const { width, height, margin } = CHART_DIMENSIONS;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const baselineY = margin.top + innerHeight;

  if (!data.length) {
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" rx="16" fill="rgba(20, 71, 229, 0.06)" />
        <text x="50%" y="50%" fill="#6b7280" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">
          No rewards yet
        </text>
      </svg>
    `;
  }

  // Normalize rewards so the chart baseline matches the client card rendering.
  const normalizedSeries = data.map((point) => ({
    ...point,
    normalizedReward: Math.max(0, point.rewards - minimumRewardValue),
  }));

  const maxValue = normalizedSeries.reduce(
    (max, point) => Math.max(max, point.normalizedReward),
    Number.NEGATIVE_INFINITY
  );
  const safeRange = maxValue === 0 ? 1 : maxValue;

  const xPositions = normalizedSeries.map((_, index) => {
    if (normalizedSeries.length === 1) {
      return margin.left + innerWidth / 2;
    }

    return margin.left + (index / (normalizedSeries.length - 1)) * innerWidth;
  });

  const points = normalizedSeries.map((point, index) => {
    const y = margin.top + (1 - point.normalizedReward / safeRange) * innerHeight;
    return {
      x: xPositions[index],
      y,
      date: point.trigger_date,
    };
  });

  const areaPath = buildAreaPath(points, baselineY);

  const gridLines = Array.from({ length: 4 }).map((_, index) => {
    const y = margin.top + (index / 3) * innerHeight;
    return `<line x1="${margin.left}" y1="${y.toFixed(2)}" x2="${width - margin.right}" y2="${y.toFixed(2)}" stroke="rgba(107, 114, 128, 0.15)" stroke-width="1" />`;
  });

  const tickCount = Math.min(4, normalizedSeries.length);
  const tickIndexes = new Set<number>();

  if (tickCount === normalizedSeries.length) {
    normalizedSeries.forEach((_, index) => tickIndexes.add(index));
  } else {
    tickIndexes.add(0);
    tickIndexes.add(normalizedSeries.length - 1);

    if (normalizedSeries.length > 2) {
      const step = (normalizedSeries.length - 1) / (tickCount - 1);
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
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1447e5" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#1447e5" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="rgba(20, 71, 229, 0.08)" />
      <g>
        <line x1="${margin.left}" y1="${baselineY}" x2="${width - margin.right}" y2="${baselineY}" stroke="#d1d5db" stroke-width="1.5" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${baselineY}" stroke="#d1d5db" stroke-width="1.5" />
      </g>

      <g>
        ${gridLines.join("\n")} 
      </g>

      <path d="${areaPath}" fill="url(#chartFill)" stroke="#1447e5" stroke-width="3" stroke-linejoin="round" />

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

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${userAddress}`] as IUserData | undefined;
  const username = (await getProfileUsername(userAddress)) || "Anonymous";

  const logoAbsPath = path.join(process.cwd(), "public", "logo.svg");
  const logoFile = readFileSync(logoAbsPath).toString("utf-8");



  const rewardEvents = await fetch(`${appConfig.NOTIFY_URL}/history/${userAddress}`).then(res => res.json()).catch(() => []);

  const frdTokenMeta = __GLOBAL_STORE__?.getOwnToken();
  const decimals = frdTokenMeta?.decimals ?? 9;
  const symbol = frdTokenMeta?.symbol ?? "FRD";

  const rewardSeries = buildRewardSeries(rewardEvents, decimals);

  const minimumRewardValue =
    minBy(rewardSeries, (point) => point.rewards)?.rewards ?? 0;

  // chart

  const chartSvg = generateChartSvg(rewardSeries, minimumRewardValue);

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

        <!-- Decorative circles -->
        <circle cx="100" cy="100" r="80" fill="rgba(29, 78, 184, 0.05)" />
        <circle cx="1100" cy="530" r="100" fill="rgba(37, 99, 235, 0.05)" />

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

        <g transform="translate(0, 50)">
      <g transform="translate(120, 115)">
        ${chartSvg}
          </g>

          <!-- Username -->
          <text
            x="750"
            y="160"
            font-family="Arial, sans-serif"
            font-size="64"
            font-weight="700"
            fill="#1f2937"
          >
            ${username}
          </text>

          <g transform="translate(170, 20)">
            <!-- Stat label -->
            <text
              x="580"
              y="260"
              font-family="Arial, sans-serif"
              font-size="48"
              font-weight="400"
              fill="#57534d"
            >
              Total rewards
            </text>

            <!-- Stat value -->
            <text
              x="580"
              y="330"
              font-family="Arial, sans-serif"
              font-size="48"
              font-weight="700"
              fill="#1d4ed8"
            >
              ${toLocalString((((userData?.liquid_rewards ?? 0) + (userData?.locked_rewards ?? 0) + (userData?.new_user_rewards ?? 0)) / 10 ** decimals).toPrecision(decimals - 3))} ${symbol}
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