import { env } from "@/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = "https://discord.com/api/v10";

type DiscordUser = {
  id: string;
  username: string;
  discriminator?: string;
  avatar: string | null; // hash or null
};

function isSnowflake(id: string) {
  return /^\d{15,21}$/.test(id);
}

export async function GET(req: Request) {
  try {
    if (!env.DISCORD_BOT_TOKEN) return new Response("DISCORD_BOT_TOKEN is not set", { status: 500 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !isSnowflake(userId)) {
      return new Response("Missing or invalid userId", { status: 400 });
    }

    // 1) Fetch user object from Discord API
    const userRes = await fetch(`${API_BASE}/users/${userId}`, {
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!userRes.ok) {
      // 401/403 — токен/права, 404 — юзер не найден или недоступен
      return new Response(`Discord API error (${userRes.status})`, { status: 502 });
    }

    const user = (await userRes.json()) as DiscordUser;

    // 2) Build CDN URL for avatar (or default)
    let avatarUrl: string;

    if (user.avatar) {
      // If avatar hash starts with "a_", it's animated (gif)
      const isAnimated = user.avatar.startsWith("a_");
      const ext = isAnimated ? "gif" : "png";
      // You can change size: 64/128/256/512/1024/2048/4096
      avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=512`;
    } else {
      // Default avatar: discriminator-based is legacy; current default uses (id >> 22) % 6
      const index = Number((BigInt(user.id) >> 22n) % 6n);
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }

    // 3) Stream image back (proxy)
    const imgRes = await fetch(avatarUrl, { cache: "no-store" });
    if (!imgRes.ok || !imgRes.body) {
      return new Response("Failed to fetch avatar image", { status: 502 });
    }

    const contentType = imgRes.headers.get("content-type") || "application/octet-stream";

    return new Response(imgRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'inline; filename="discord-avatar.png"',
        "Cache-Control": "private, max-age=360",
      },
    });
  } catch (e: unknown) {
    console.error("[Discord Avatar API]", e);
    return new Response("Failed to fetch avatar", { status: 500 });
  }
}