import { getImageExtension } from "@/lib/get-image-extension";
import { getImageMimeType } from "@/lib/get-image-mime-type";
import { getTgUserEntity } from "@/lib/get-tg-user-entity";
import { getTelegramClient } from "@/lib/telegram-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IS_BIG_PHOTO = false; // For avatar, we want the small version of the profile photo
const PHOTO_CACHE_TTL = 604800; // 1 week in seconds

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    // Normalize username (remove @ if present)
    const normalizedUsername = username?.startsWith("@")
      ? username.slice(1)
      : username;

    if (normalizedUsername && !/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(normalizedUsername)) {
      console.error(`tg(avatar): Invalid username format for user ${userId}`);
      return new Response("Invalid username format", { status: 400 });
    }

    const tgClient = await getTelegramClient();

    if (!tgClient) {
      return new Response("Telegram service not configured", { status: 503 });
    }

    // Step 1: Try to get user entity by username or userId

    let entity;
    try {
      entity = await getTgUserEntity({ username: normalizedUsername, userId });
    } catch {
      entity = null;
    }

    // Step 2: download profile photo if entity found
    if (!entity) {
      return new Response("User not found", { status: 404 });
    }

    const photoBuffer = await tgClient.downloadProfilePhoto(entity, {
      isBig: IS_BIG_PHOTO
    });

    if (!photoBuffer || (typeof photoBuffer === "string") || photoBuffer.length === 0) {
      console.error(`tg(avatar): User ${userId} found but has no profile photo`);
      return new Response("No profile photo", { status: 404 });
    }

    console.error(`tg(avatar): User ${userId} found, serving photo`);
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
      "Cache-Control": `public, max-age=${PHOTO_CACHE_TTL}`, // 1 week cache
    },
  });
}
