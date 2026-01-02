import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { getProfileUsernames } from "@/lib/get-profile-usernames.server";
import { toLocalString } from "@/lib/to-local-string";

export async function GET(
  _req: NextRequest,
) {
  const logoAbsPath = path.join(process.cwd(), "public", "logo.svg");
  const logoFile = readFileSync(logoAbsPath).toString("utf-8");

  try {
    // Get leaderboard data
    const leaderboardData = globalThis.__GLOBAL_STORE__?.getLeaderboardData() || [];
    const frdToken = globalThis.__GLOBAL_STORE__?.getOwnToken();
    const { symbol = "FRD", decimals = 0 } = frdToken || {};

    // Get top 3 users
    const top3 = leaderboardData.sort((a, b) => b.amount - a.amount).slice(0, 3);
    const usernames = await getProfileUsernames(top3.map(d => d.address));

    // Prepare top 3 data for display
    const top3Data = top3.map((user, index) => {
      const username = usernames.find((u) => u.address === user.address)?.username;
      return {
        rank: index + 1,
        username: username || user.address.slice(0, 8) + "...",
        amount: toLocalString(+Number(user.amount / 10 ** decimals).toPrecision(4)),
        friends: user.friends,
      };
    });
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
            y="200"
            font-family="Arial, sans-serif"
            font-size="64"
            font-weight="600"
            fill="white"
            text-anchor="middle"
          >
            Leaderboard
          </text>

          <!-- Top 3 Users -->
          ${top3Data.map((user, index) => {
      const yPosition = 300 + (index * 100);
      const cardY = yPosition - 40;
      const cardHeight = 80;
      const textY = cardY + (cardHeight / 2);

      return `
              <!-- User ${user.rank} Card -->
              <g filter="url(#cardShadow)">
                <rect
                  x="100"
                  y="${cardY}"
                  width="1000"
                  height="${cardHeight}"
                  rx="12"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                  stroke-width="1"
                />
                
                <!-- Medal -->
                <text
                  x="140"
                  y="${textY}"
                  font-family="Arial, sans-serif"
                  font-size="34"
                  fill="#6b7280"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  #${index + 1}
                </text>
                
                <!-- Username -->
                <text
                  x="200"
                  y="${textY}"
                  font-family="Arial, sans-serif"
                  font-size="34"
                  font-weight="600"
                  fill="#111827"
                  text-anchor="start"
                  dominant-baseline="middle"
                >
                  ${user.username.length > 14 ? user.username.slice(0, 12) + '...' : user.username.slice(0, 14)}
                </text>
                
                <!-- Amount -->
                <text
                  x="700"
                  y="${textY}"
                  font-family="Arial, sans-serif"
                  font-size="34"
                  font-weight="500"
                  fill="#1d4ed8"
                  text-anchor="end"
                  dominant-baseline="middle"
                >
                  ${user.amount} ${symbol}
                </text>
                
                <!-- Friends -->
                <text
                  x="900"
                  y="${textY}"
                  font-family="Arial, sans-serif"
                  font-size="34"
                  fill="#6b7280"
                  text-anchor="end"
                  dominant-baseline="middle"
                >
                  ${user.friends} friends
                </text>
              </g>
            `;
    }).join('')}

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