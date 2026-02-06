import "server-only";

import { env } from "@/env";

const TG_BOT_API = "https://api.telegram.org/bot";

export type BotPhotoResult =
  | { status: "ok"; buffer: Buffer }
  | { status: "not_found" }
  | { status: "error" };

/**
 * Finds a Telegram user by numeric ID in a configured channel via Bot API,
 * and downloads their profile photo.
 *
 * Returns:
 * - { status: "ok", buffer } when a photo is found
 * - { status: "not_found" } when Bot API succeeds but user has no photo
 * - { status: "error" } for any Bot API failure (allows fallback)
 */
export async function getTgUserPhotoByBotInChannel(
  userId: string
): Promise<BotPhotoResult> {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const channel = env.TELEGRAM_CHANNEL;

  if (!botToken || !channel) {
    console.error("[TG Avatar API] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL configuration");
    return { status: "error" };
  }

  try {
    // 1. Try to get profile photos
    const photosRes = await fetch(
      `${TG_BOT_API}${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );

    const photosData = await photosRes.json();

    if (!photosData.ok) {
      console.error("[TG Avatar API] Failed to get profile photos for user", userId);
      return { status: "error" };
    }

    if (photosData.result.total_count === 0) {
      console.error("[TG Avatar API] No profile photos found for user", userId);
      return { status: "not_found" };
    }

    // 2. Get file path for the biggest photo size (last in the array)
    const sizes = photosData.result.photos[0];
    const biggest = sizes[sizes.length - 1];

    const fileRes = await fetch(
      `${TG_BOT_API}${botToken}/getFile?file_id=${biggest.file_id}`
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
      console.error("[TG Avatar API] Failed to get file path for user", userId);
      return { status: "error" };
    }

    // 3. Download the photo
    const imageRes = await fetch(
      `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
    );

    if (!imageRes.ok) {
      console.error("[TG Avatar API] Failed to download photo for user", userId);
      return { status: "error" };
    }

    console.error(`[TG Avatar API] User ${userId} found in channel, serving photo`);
    return { status: "ok", buffer: Buffer.from(await imageRes.arrayBuffer()) };
  } catch (e) {
    console.error("[TG Avatar API] Channel lookup failed:", e);
    return { status: "error" };
  }
}
