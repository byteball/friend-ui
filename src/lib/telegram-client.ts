import "server-only";

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { env } from "@/env";

// Use globalThis to persist client across hot reloads in development
const globalForTelegram = globalThis as unknown as {
  telegramClient: TelegramClient | null;
  telegramConnecting: Promise<TelegramClient> | null;
};

globalForTelegram.telegramClient ??= null;
globalForTelegram.telegramConnecting ??= null;

/**
 * Returns a singleton TelegramClient instance.
 * Thread-safe: concurrent calls will wait for the same connection promise.
 * 
 * Note: The client persists for the lifetime of the Node.js process.
 * This is intentional to avoid reconnection overhead on each request.
 * Memory usage is minimal (~few MB) and connections are managed by gramjs.
 */
export async function getTelegramClient(): Promise<TelegramClient | null> {
  // Return existing connected client
  if (globalForTelegram.telegramClient?.connected) {
    return globalForTelegram.telegramClient;
  }

  // Clean up disconnected client before reconnecting
  if (globalForTelegram.telegramClient && !globalForTelegram.telegramClient.connected) {
    console.log('[Telegram] Client disconnected, cleaning up before reconnect...');
    try {
      // Ensure old client is fully disconnected to free resources
      await globalForTelegram.telegramClient.disconnect();
    } catch {
      // Ignore disconnect errors on already disconnected client
    }
    globalForTelegram.telegramClient = null;
  }

  // If connection is in progress, wait for it
  if (globalForTelegram.telegramConnecting) {
    return globalForTelegram.telegramConnecting;
  }

  // Validate required env vars
  if (!env.TELEGRAM_API_ID || !env.TELEGRAM_API_HASH || !env.TELEGRAM_SESSION) {
    return null;
  }

  // Start new connection
  globalForTelegram.telegramConnecting = (async () => {
    const stringSession = new StringSession(env.TELEGRAM_SESSION);
    const c = new TelegramClient(
      stringSession,
      env.TELEGRAM_API_ID!,
      env.TELEGRAM_API_HASH!,
      {
        connectionRetries: 10,
      }
    );

    await c.connect();
    globalForTelegram.telegramClient = c;

    // Reset connecting promise after successful connection
    // This allows reconnection if the client disconnects later
    globalForTelegram.telegramConnecting = null;

    return c;
  })();

  // Handle connection failure
  globalForTelegram.telegramConnecting.catch(() => {
    globalForTelegram.telegramConnecting = null;
    globalForTelegram.telegramClient = null;
  });

  return globalForTelegram.telegramConnecting;
}

/**
 * Disconnects the Telegram client if connected.
 * Useful for graceful shutdown.
 */
export async function disconnectTelegramClient(): Promise<void> {
  if (globalForTelegram.telegramClient?.connected) {
    await globalForTelegram.telegramClient.disconnect();
    globalForTelegram.telegramClient = null;
    globalForTelegram.telegramConnecting = null;
  }
}
