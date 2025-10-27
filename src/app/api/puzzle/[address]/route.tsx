import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";

import { generatePuzzleSvg } from "@/components/ui/puzzle-image-unoptimized";
import { env } from "@/env";
import { getGhostsFromVars } from "@/features/profile/domain/get-ghosts-from-vars";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { getNumberByAddress } from "@/lib/get-number-by-address";
import { isValidAddress } from "@/lib/is-valid-address";

export const runtime = "nodejs"; // Puppeteer requires Node.js runtime
export const dynamic = "force-dynamic"; // Avoid caching during development

const PUZZLE_IMAGE_SIZE = 500;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address: userAddress } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${userAddress}`] as IUserData | undefined;
  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

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

  const svgString = generatePuzzleSvg({
    src: currentGhostImageBase64,
    width: PUZZLE_IMAGE_SIZE,
    height: PUZZLE_IMAGE_SIZE,
    rows: Math.sqrt(requiredStreak),
    columns: Math.sqrt(requiredStreak),
    filledCells: Math.min(userData?.current_streak ?? 0, requiredStreak),
  });

  let buffer: Buffer;

  try {
    const svgBuffer = Buffer.from(svgString);
    buffer = await sharp(svgBuffer).resize(PUZZLE_IMAGE_SIZE, PUZZLE_IMAGE_SIZE).png().toBuffer();
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=30, s-maxage=30",
    },
  });
}