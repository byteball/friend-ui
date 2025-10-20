import { PuzzleImageUnoptimized } from "@/components/ui/puzzle-image-unoptimized";
import { ghostList } from "@/ghost-list";
import { getPage, releasePage } from "@/lib/puppeteer";
import { renderComponentToHtml } from "@/lib/renderComponentToHtml";
import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";


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

  const html = await renderComponentToHtml(
    <PuzzleImageUnoptimized
      src={imageBase64}
      showBorder={false}
      rows={Math.sqrt(requiredStreak)}
      columns={Math.sqrt(requiredStreak)}
      filledCeils={2}
      width={495}
      height={495}
      className="mx-auto" />,
    {
      width: 500,
      height: 500,
    }
  )

  const page = await getPage();

  try {
    await page.setViewport({ width: 510, height: 510, deviceScaleFactor: 1 });

    await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`, {
      waitUntil: "domcontentloaded",
    });

    const buffer = await page.screenshot({ type: "png", fullPage: false });

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, s-maxage=0",
      },
    });
  } finally {
    await releasePage(page);
  }
}