import { generatePuzzleSvg } from "@/components/ui/puzzle-image-unoptimized";
import { ghostList } from "@/ghost-list";
import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";
import sharp from "sharp";


export const runtime = "nodejs"; // Puppeteer requires Node.js runtime
export const dynamic = "force-dynamic"; // Avoid caching during development

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${address}`] as IUserData | undefined;

  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

  const image = ghostList["Tim May"].image; // select image based on user data

  const imageAbsPath = path.join(process.cwd(), 'public', image);

  const imageBuffer = readFileSync(imageAbsPath);
  const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const SVG = generatePuzzleSvg({
    src: imageBase64,
    width: 500,
    height: 500,
    rows: Math.sqrt(requiredStreak),
    columns: Math.sqrt(requiredStreak),
    filledCeils: 1
  });

  let buffer: Buffer;

  try {
    const svgBuffer = Buffer.from(SVG);
    buffer = await sharp(svgBuffer).resize(500, 500).png().toBuffer();
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, s-maxage=0",
    },
  });
}