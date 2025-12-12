import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { generatePuzzleSvg } from "@/components/ui/puzzle-image-unoptimized";
import { env } from "@/env";
import { getRequiredStreak } from "@/features/ghost/domain/get-required-streak";
import { getGhostsFromVars } from "@/features/profile/domain/get-ghosts-from-vars";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { getNumberByAddress } from "@/lib/get-number-by-address";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { isValidAddress } from "@/lib/is-valid-address";

export const dynamic = "force-dynamic"; // Avoid caching during development

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: userAddress } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${userAddress}`] as IUserData | undefined;
  const username = (await getProfileUsername(userAddress)) || "Anonymous";

  const requiredStreak = getRequiredStreak(userData?.current_ghost_num);
  const allGhosts = getGhostsFromVars(state ?? {});
  const userFriends = getFriendList(state ?? {}, userAddress);

  const userGhostFriends = userFriends.filter(f => !isValidAddress(f.address));
  const ghostFriendsIds = userGhostFriends.map(f => allGhosts.findIndex(g => g.name === f.address));

  const selectedGhost = await fetch(`${env.NEXT_PUBLIC_NOTIFY_URL}/user-ghost/${userAddress}`)
    .then(res => res.json()).then(data => data.ghost_name || null as string | null)
    .catch(() => null);

  let currentGhostIndex = -1;

  if (!selectedGhost || userGhostFriends.find(f => f.address === selectedGhost)) {
    currentGhostIndex = getNumberByAddress(userAddress, allGhosts.length - 1, ghostFriendsIds);
  } else {
    currentGhostIndex = allGhosts.findIndex(g => g.name === selectedGhost);
  }

  const currentGhostImage = allGhosts[currentGhostIndex]?.image ?? "/ghosts/default.png";

  // Puzzle image generation process
  const currentGhostImagePath = path.join(process.cwd(), 'public', currentGhostImage);
  const currentGhostImageBuffer = readFileSync(currentGhostImagePath);
  const currentGhostImageBase64 = `data:image/png;base64,${currentGhostImageBuffer.toString('base64')}`;

  const logoAbsPath = path.join(process.cwd(), "public", "logo.svg");
  const logoFile = readFileSync(logoAbsPath).toString("utf-8");

  const ghost = generatePuzzleSvg({
    src: currentGhostImageBase64,
    width: 400,
    height: 400,
    rows: Math.sqrt(requiredStreak),
    columns: Math.sqrt(requiredStreak),
    filledCells: requiredStreak - (userData?.current_streak || 0),
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

          <g transform="translate(0, 20)">
            <!-- Stat label -->
            <text
              x="580"
              y="260"
              font-family="Arial, sans-serif"
              font-size="48"
              font-weight="400"
              fill="#57534d"
            >
              Current streak:
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
              ${userData?.current_streak || 0} out of ${requiredStreak}
            </text>

            <text
              x="580"
              y="400"
              font-family="Arial, sans-serif"
              font-size="48"
              font-weight="300"
              fill="#57534d"
            >
              <tspan x="580" dy="0">days to become friends</tspan>
              <tspan x="580" dy="60">with ${allGhosts[currentGhostIndex].name}</tspan>
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