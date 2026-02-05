import "server-only";

import { env } from "@/env";

const TG_BOT_API = "https://api.telegram.org/bot";

/**
 * Finds a Telegram user by numeric ID in a configured channel via Bot API,
 * and downloads their profile photo.
 *
 * Returns the photo as a Buffer, or null if:
 * - TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL is not configured
 * - the bot cannot access the channel or check membership
 * - the user is not a member of the channel
 * - the user has no profile photo
 */
export async function getTgUserPhotoByBotInChannel(
  userId: string
): Promise<Buffer | null> {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const channel = env.TELEGRAM_CHANNEL;

  if (!botToken || !channel) {
    console.error("[TG Avatar API] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL configuration");
    return null;
  }

  try {
    // 1. Verify user is a member of the channel
    const memberRes = await fetch(
      `${TG_BOT_API}${botToken}/getChatMember?chat_id=@${channel}&user_id=${userId}`
    );
    const memberData = await memberRes.json();

    if (!memberData.ok) {
      return null;
    }

    // 2. Get profile photos
    const photosRes = await fetch(
      `${TG_BOT_API}${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );
    const photosData = await photosRes.json();

    if (!photosData.ok || photosData.result.total_count === 0) {
      return null;
    }

    // 3. Get file path for the biggest photo size (last in the array)
    const sizes = photosData.result.photos[0];
    const biggest = sizes[sizes.length - 1];

    const fileRes = await fetch(
      `${TG_BOT_API}${botToken}/getFile?file_id=${biggest.file_id}`
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
      console.error("[TG Avatar API] Failed to get file path for user", userId);
      return null;
    }

    // 4. Download the photo
    const imageRes = await fetch(
      `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`
    );

    if (!imageRes.ok) {
      console.error("[TG Avatar API] Failed to download photo for user", userId);
      return null;
    }

    console.error(`[TG Avatar API] User ${userId} found in channel, serving photo`);
    return Buffer.from(await imageRes.arrayBuffer());
  } catch (e) {
    console.error("[TG Avatar API] Channel lookup failed:", e);
    return null;
  }
}
