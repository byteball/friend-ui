import { getImageMimeType } from "@/lib/get-image-mime-type";
import { getTelegramClient } from "@/lib/telegram-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
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
      return new Response("Invalid username format", { status: 400 });
    }

    const tgClient = await getTelegramClient();

    if (!tgClient) {
      return new Response("Telegram service not configured", { status: 503 });
    }

    // Get user entity by username
    let entity;
    try {
      entity = await tgClient.getEntity(normalizedUsername);
    } catch {
      return new Response("User not found", { status: 404 });
    }

    // Download profile photo as Buffer
    const photoBuffer = await tgClient.downloadProfilePhoto(entity, {
      isBig: true,
    });

    if (!photoBuffer || (typeof photoBuffer === "string") || photoBuffer.length === 0) {
      return new Response("No profile photo", { status: 404 });
    }

    const mimeType = getImageMimeType(photoBuffer);
    const extension = mimeType.split("/")[1];

    return new Response(new Uint8Array(photoBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="avatar.${extension}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: unknown) {
    console.error("[TG Avatar API]", e);
    return new Response("Failed to fetch avatar", { status: 500 });
  }
}