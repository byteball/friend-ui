import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { ghostList } from "@/ghost-list";
import { getProfileUsername } from "@/lib/getProfileUsername.server";

export const runtime = "nodejs"; // Puppeteer requires Node.js runtime
export const dynamic = "force-dynamic"; // Avoid caching during development

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${address}`] as IUserData | undefined;
  const username = await getProfileUsername(address) || "Anonymous";

  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

  const image = ghostList["Tim May"].image; // select image based on user data

  const imageAbsPath = path.join(process.cwd(), 'public', image);

  const imageBuffer = readFileSync(imageAbsPath);
  const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;


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
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="0" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="80" fill="rgba(29, 78, 184, 0.05)"/>
      <circle cx="1100" cy="530" r="100" fill="rgba(37, 99, 235, 0.05)"/>
      
      <!-- Puzzle container with background -->
      <rect x="120" y="115" width="400" height="400" fill="url(#puzzleGradient)" filter="url(#cardShadow)"/>
      
      <!-- Puzzle image -->
      <image href="${imageBase64}" x="120" y="115" width="400" height="400" preserveAspectRatio="xMidYMid slice"/>
      
      <!-- Username -->
      <text x="580" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#1f2937">${username}</text>
      
      <!-- Stat card background -->
      <rect x="580" y="220" width="500" height="150" rx="16" fill="white" filter="url(#cardShadow)"/>
      
      <!-- Flame icon -->
      <g transform="translate(605, 245)">
        <path d="M20 45 C20 45, 15 30, 15 22 C15 15, 20 10, 25 15 C25 10, 30 5, 35 12 C40 18, 40 32, 35 38 C30 45, 25 45, 20 45 Z" 
              fill="#f59e0b" opacity="0.9" transform="scale(1.3)"/>
      </g>
      
      <!-- Stat label -->
      <text x="685" y="265" font-family="Arial, sans-serif" font-size="20" font-weight="400" fill="#6b7280">Current streak</text>
      
      <!-- Stat value -->
      <text x="685" y="305" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#1d4ed8">${userData?.current_streak ?? 0} out of ${requiredStreak}</text>
      
      <!-- Stat unit -->
      <text x="685" y="335" font-family="Arial, sans-serif" font-size="20" font-weight="300" fill="#9ca3af">days to become friends with Tim May</text>
      
      <!-- Footer -->
      <text x="600" y="610" font-family="Arial, sans-serif" font-size="24" font-weight="300" fill="#d2d4d8" text-anchor="middle">friend.obyte.org</text>
    </svg>
    `;

    const svgBuffer = Buffer.from(SVG);
    const buffer = await sharp(svgBuffer).resize(1200, 630).png().toBuffer();

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, s-maxage=0",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}