import { readFileSync } from "fs";
import { NextRequest } from "next/server";
import path from "path";

import { PuzzleImageUnoptimized } from "@/components/ui/puzzle-image-unoptimized";
import { ghostList } from "@/ghost-list";
import { getFriendList } from "@/lib/calculations/getFriendList";
import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { getPage, releasePage } from "@/lib/puppeteer";
import { renderComponentToHtml } from "@/lib/renderComponentToHtml";

export const runtime = "nodejs"; // Puppeteer requires Node.js runtime
export const dynamic = "force-dynamic"; // Avoid caching during development

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  const state = __GLOBAL_STORE__?.getState();
  const userData = state?.[`user_${address}`] as IUserData | undefined;
  const username = await getProfileUsername(address) || "Anonymous";
  const friends = getFriendList(state ?? {}, address);

  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

  const image = ghostList["Tim May"].image; // select image based on user data

  const imageAbsPath = path.join(process.cwd(), 'public', image);

  const imageBuffer = readFileSync(imageAbsPath);
  const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const puzzleHtml = await renderComponentToHtml(
    <PuzzleImageUnoptimized
      src={imageBase64}
      showBorder={false}
      rows={Math.sqrt(requiredStreak)}
      columns={Math.sqrt(requiredStreak)}
      filledCeils={userData?.current_streak ?? 0}
      width={400}
      height={400}
      className="" />,
    {
      width: 400,
      height: 400,
    }
  )

  const page = await getPage();

  try {
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          font-family: Arial, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .decorative-circle-1 {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: rgba(29, 78, 184, 0.05);
        }

        .decorative-circle-2 {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.05);
        }

        .container {
          position: absolute;
          top: 115px;
          left: 120px;
          display: flex;
          gap: 60px;
        }

        .puzzle-container {
          width: 400px;
          height: 400px;
          background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .content {
          width: 380px;
        }

        .username {
          font-size: 42px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 40px;
        }

        .username::first-letter {
          text-transform: uppercase;
        }

        .stat-card {
          width: 380px;
          height: 120px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 25px 30px;
          position: relative;
        }

        .stat-icon {
          position: absolute;
          left: 30px;
          top: 35px;
        }

        .stat-label {
          font-size: 16px;
          font-weight: 400;
          color: #6b7280;
          margin-left: 60px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #1d4ed8;
          margin-left: 60px;
          display: inline-block;
        }

        .stat-unit {
          font-size: 18px;
          font-weight: 500;
          color: #9ca3af;
          margin-left: 10px;
        }

        .flame-icon {
          width: 50px;
          height: 50px;
        }

        .friends-icon {
          width: 50px;
          height: 50px;
        }

        .footer {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
          font-weight: 300;
          color: #d2d4d8;
          letter-spacing: 0.5px;
        }
      </style>
    </head>

    <body>
      <div class="decorative-circle-1"></div>
      <div class="decorative-circle-2"></div>
      
      <div class="container">
        <div class="puzzle-container">
          ${puzzleHtml}
        </div>
        
        <div class="content">
          <div class="username">${username}</div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg class="flame-icon" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 45 C20 45, 15 30, 15 22 C15 15, 20 10, 25 15 C25 10, 30 5, 35 12 C40 18, 40 32, 35 38 C30 45, 25 45, 20 45 Z" 
                      fill="#f59e0b" opacity="0.9"/>
              </svg>
            </div>
            <div class="stat-label">Current streak</div>
            <div>
              <span class="stat-value">${userData?.current_streak ?? 0}</span>
              <span class="stat-unit">days</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <svg class="friends-icon" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="10" fill="#1d4ed8" opacity="0.7"/>
                <circle cx="35" cy="15" r="10" fill="#1d4ed8"/>
                <path d="M5 45 Q15 30, 25 45" stroke="#1d4ed8" stroke-width="3" fill="none" opacity="0.7"/>
                <path d="M25 45 Q35 30, 45 45" stroke="#1d4ed8" stroke-width="3" fill="none"/>
              </svg>
            </div>
            <div class="stat-label">Total friends</div>
            <span class="stat-value">${friends.length}</span>
          </div>
        </div>
      </div>
      <div class="footer">friend.obyte.org</div>
    </body>
    </html>
    `;

    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

    await page.goto(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`, {
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