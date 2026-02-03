import { env } from "@/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function tg<T>(method: string, params: Record<string, unknown>): Promise<T> {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("BOT_TOKEN is not set");

  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Don't cache Telegram API responses in Next.js fetch cache
    cache: "no-store",
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const msg = json?.description || `Telegram API error (${res.status})`;
    throw new Error(msg);
  }
  return json.result as T;
}

type TgPhotoSize = { file_id: string; file_size?: number };
type TgGetUserProfilePhotos = { total_count: number; photos: TgPhotoSize[][] };
type TgGetFile = { file_path: string };

export async function GET(req: Request) {
  try {
    if (!env.TELEGRAM_BOT_TOKEN) {
      return new Response("BOT_TOKEN is not set", { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userIdRaw = searchParams.get("userId");

    if (!userIdRaw || !/^\d+$/.test(userIdRaw)) {
      return new Response("Missing or invalid userId", { status: 400 });
    }

    const userId = Number(userIdRaw);

    // 1) Get profile photos (first photo only)
    let photos: TgGetUserProfilePhotos;
    try {
      photos = await tg<TgGetUserProfilePhotos>("getUserProfilePhotos", {
        user_id: userId,
        limit: 1,
      });
    } catch (e) {
      // Handle "user not found" or similar Telegram API errors
      const message = e instanceof Error ? e.message : "Unknown error";
      if (message.includes("user not found") || message.includes("Bad Request")) {
        return new Response("User not found", { status: 404 });
      }
      throw e;
    }

    if (!photos.total_count || !photos.photos?.length || !photos.photos[0]?.length) {
      return new Response("No profile photo", { status: 404 });
    }

    // 2) Pick the biggest size from the first photo set
    const sizes = photos.photos[0];
    const biggest = sizes.reduce((a, b) => {
      const as = a.file_size ?? 0;
      const bs = b.file_size ?? 0;
      return bs > as ? b : a;
    }, sizes[0]);

    // 3) Resolve file_path
    const file = await tg<TgGetFile>("getFile", { file_id: biggest.file_id });
    if (!file?.file_path) {
      return new Response("Failed to resolve file path", { status: 502 });
    }

    // 4) Stream the image back to client (no saving)
    const fileUrl = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const fileRes = await fetch(fileUrl, { cache: "no-store" });

    if (!fileRes.ok || !fileRes.body) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType =
      fileRes.headers.get("content-type") || "application/octet-stream";

    return new Response(fileRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Inline display in browser; change filename if you want
        "Content-Disposition": 'inline; filename="avatar.jpg"',
        // Tune caching if needed
        "Cache-Control": "private, max-age=360",
      },
    });
  } catch (e: unknown) {
    console.error("[TG Avatar API]", e);
    return new Response("Failed to fetch avatar", { status: 500 });
  }
}