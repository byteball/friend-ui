import "server-only";

import { env } from "@/env";
import { Entity } from "telegram/define";
import { getTelegramClient } from "./telegram-client";

const TG_BOT_API = "https://api.telegram.org/bot";

export const getTgUserEntity = async ({ username, userId }: { username: string | null, userId: string }): Promise<Entity | null> => {
  const tgClient = await getTelegramClient();

  if (!tgClient) {
    throw new Error("Telegram service not configured");
  }

  const botToken = env.TELEGRAM_BOT_TOKEN;
  const channel = env.TELEGRAM_CHANNEL;

  if (!botToken || !channel) {
    throw new Error("Telegram bot API not configured");
  }

  // 1. Try to find entity in channel/chat via Bot API (fast path)

  const memberRes = await fetch(
    `${TG_BOT_API}${botToken}/getChatMember?chat_id=@${channel}&user_id=${userId}`
  );

  const memberData = await memberRes.json();
  let memberUsername: string | undefined;

  if (memberData.ok) {
    memberUsername = memberData.result.user.username;

    if (memberUsername) {
      try {
        const entity = await tgClient.getEntity(memberUsername);

        if (entity && entity.id.toString() === String(userId)) {
          console.error(`[TG BOT API](Entity) User ${userId} found in channel @${channel}`);
          return entity;
        } else {
          console.error(`[TG BOT API](Entity) User ${userId} found in channel @${channel} but entity ID mismatch or missing`);
        }
      } catch {
        console.error(`[TG BOT API](Entity) Failed to fetch entity for user ${userId} via GramJS`);
      }
    } else {
      console.error(`[TG BOT API](Entity) User ${userId} is a member of channel @${channel} but has no username`);
    }
  } else {
    console.error(`[TG BOT API](Entity) User ${userId} is not a member of channel @${channel}`);
  }

  // 2. Fallback: fetch entity by username via GramJS (slower, may fail if user has no username)

  const entityUsername = memberUsername || username;

  if (!entityUsername) {
    console.error(`[TG GRAMJS](Entity) No username available for user ${userId}, cannot fetch entity`);
    return null;
  }

  try {
    const entity = await tgClient.getEntity(entityUsername);

    if (entity.id.toString() === String(userId)) {
      console.error(`[TG GRAMJS](Entity) User ${userId} found by username ${entityUsername}, serving entity`);
      return entity;
    } else {
      console.error(`[TG GRAMJS](Entity) User ID mismatch for username ${entityUsername}: expected ${userId}, got ${entity.id}`);
      return null;
    }
  } catch (error) {
    console.error(`[TG GRAMJS](Entity) Failed to fetch entity for username ${entityUsername}:`, error);
  }

  return null;
}
