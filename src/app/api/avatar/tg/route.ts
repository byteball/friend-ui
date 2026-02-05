import { getImageExtension } from "@/lib/get-image-extension";
import { getImageMimeType } from "@/lib/get-image-mime-type";
import { getTgUserPhotoByBotInChannel } from "@/lib/get-tg-user-photo-by-bot-in-channel";
import { getTelegramClient } from "@/lib/telegram-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    // 1) Try Bot API + channel membership (fast path)
    const avatarBuffer = await getTgUserPhotoByBotInChannel(userId);

    if (avatarBuffer) {
      console.error(`tg(avatar): User ${userId} found in channel, serving photo`);
      return servePhoto(avatarBuffer);
    }

    // 2) Fallback: fetch profile photo via GramJS (requires username)
    if (!username) {
      console.error(`tg(avatar): Missing username parameter for user ${userId}`);
      return new Response("Missing username parameter", { status: 400 });
    }

    // Normalize username (remove @ if present)
    const normalizedUsername = username.startsWith("@")
      ? username.slice(1)
      : username;

    // Validate Telegram username format:
    // - 5-32 characters
    // - Only letters, digits, and underscores
    // - Must start with a letter
    if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(normalizedUsername)) {
      console.error(`tg(avatar): Invalid username format for user ${userId}`);
      return new Response("Invalid username format", { status: 400 });
    }

    const tgClient = await getTelegramClient();

    if (!tgClient) {
      return new Response("Telegram service not configured", { status: 503 });
    }

    let entity;
    try {
      entity = await tgClient.getEntity(normalizedUsername);
    } catch {
      entity = null;
    }

    // 3) Verify userId matches (prevents username spoofing)
    if (!entity || entity.id.toString() !== (String(userId))) {
      return new Response("User not found or user ID does not match", { status: 404 });
    }

    const photoBuffer = await tgClient.downloadProfilePhoto(entity, {
      isBig: true,
    });

    if (!photoBuffer || (typeof photoBuffer === "string") || photoBuffer.length === 0) {
      console.error(`tg(avatar): User ${userId} found but has no profile photo`);
      return new Response("No profile photo", { status: 404 });
    }

    console.error(`tg(avatar): User ${userId} found via GramJS, serving photo`);
    return servePhoto(photoBuffer);
  } catch (error) {
    console.error("tg(avatar): Unhandled error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function servePhoto(photoBuffer: Buffer) {
  const mimeType = getImageMimeType(photoBuffer);
  const extension = getImageExtension(mimeType);

  return new Response(new Uint8Array(photoBuffer), {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="avatar.${extension}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
