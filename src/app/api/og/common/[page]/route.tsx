import { readFileSync } from "fs";
import path from "path";
import sharp from "sharp";

import { NextRequest } from "next/server";

const pagesWithCommonOGTemplate = {
  main: "Make 1% a day by making friends every day",
  governance: "Governance",
  faq: "Frequently asked questions"
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;

  if (!(page in pagesWithCommonOGTemplate)) {
    return new Response("Not Found", { status: 404 });
  }

  const title = pagesWithCommonOGTemplate[page as keyof typeof pagesWithCommonOGTemplate];

  // Split title into lines for better formatting
  const words = title.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const maxCharsPerLine = 24;

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

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
        <rect width="1200" height="630" fill="#0b0809" />

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
            fill="white"
            text-anchor="start"
            dominant-baseline="middle"
          >
            Obyte Friends
          </text>
        </g>

        

          <!-- TITLE -->
          <text
            x="600"
            y="${lines.length === 1 ? 370 : 300}"
            font-family="Arial, sans-serif"
            font-size="${lines.length === 1 ? 106 : 84}"
            font-weight="400"
            fill="white"
            text-anchor="middle"
          >
            ${lines.map((line, i) => `<tspan x="600" dy="${i === 0 ? 0 : 104}">${line}</tspan>`).join('')}
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