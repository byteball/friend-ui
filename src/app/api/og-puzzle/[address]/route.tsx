import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { generatePuzzleSvg } from "@/components/ui/puzzle-image-unoptimized";
import { ghostList } from "@/ghost-list";
import { getProfileUsername } from "@/lib/get-profile-username.server";

export const dynamic = "force-dynamic"; // Avoid caching during development

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${address}`] as IUserData | undefined;
  const username = (await getProfileUsername(address)) || "Anonymous";

  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

  const ghostImageUrl = ghostList["Tim May"].image; // select image based on user data
  const ghostImageAbsPath = path.join(process.cwd(), "public", ghostImageUrl);

  const imageBuffer = readFileSync(ghostImageAbsPath);
  const ghostImageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  const ghost = generatePuzzleSvg({
    src: ghostImageBase64,
    width: 400,
    height: 400,
    rows: Math.sqrt(requiredStreak),
    columns: Math.sqrt(requiredStreak),
    filledCells: userData?.current_streak ?? 0,
  });

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

        <text
          x="50%"
          y="70px"
          font-family="Arial, sans-serif"
          font-size="72"
          font-weight="700"
          fill="#1f2937"
          width="100%"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          Obyte Friends
        </text>

        <g transform="translate(0, 50)">
          <g transform="translate(120, 115)">
            ${ghost}
          </g>

          <!-- Username -->
          <text
            x="580"
            y="160"
            font-family="Arial, sans-serif"
            font-size="64"
            font-weight="700"
            fill="#1f2937"
          >
            ${username}
          </text>

          <!-- Stat label -->
          <text
            x="580"
            y="260"
            font-family="Arial, sans-serif"
            font-size="48"
            font-weight="400"
            fill="#6b7280"
          >
            Current streak:
          </text>

          <!-- Stat value -->
          <text
            x="580"
            y="360"
            font-family="Arial, sans-serif"
            font-size="48"
            font-weight="700"
            fill="#1d4ed8"
          >
            ${userData?.current_streak ?? 0} out of ${requiredStreak}
          </text>

        <text
          x="580"
          y="450"
          font-family="Arial, sans-serif"
          font-size="48"
          font-weight="300"
          fill="#9ca3af"
        >
          <tspan x="580" dy="0">days to become friends</tspan>
          <tspan x="580" dy="60">with Tim May</tspan>
        </text>
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
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}