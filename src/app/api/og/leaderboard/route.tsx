import { readFileSync } from "fs";
import path from "path";
import sharp from "sharp";

import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
) {
  const logoAbsPath = path.join(process.cwd(), "public", "logo.svg");
  const logoFile = readFileSync(logoAbsPath).toString("utf-8");

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

          <!-- TITLE -->
          <text
            x="600"
            y="140"
            font-family="Arial, sans-serif"
            font-size="78"
            font-weight="400"
            fill="#000"
            text-anchor="middle"
          >
            <tspan x="600" dy="104">Leaderboard</tspan>
          </text>

      </svg>
    `;

    const svgBuffer = Buffer.from(SVG);
    const ogPngBuffer = await sharp(svgBuffer).resize(1200, 630).png().toBuffer();

    return new Response(new Uint8Array(ogPngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, must-revalidate, proxy-revalidate, max-age=604800", // 7 days
      },
    });

  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}