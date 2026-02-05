import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    WS_NO_BUFFER_UTIL: z.number().default(1),
    WS_NO_UTF_8_VALIDATE: z.number().default(1),
    DISCORD_BOT_TOKEN: z.string().min(10).optional(),

    TELEGRAM_BOT_TOKEN: z.string().min(10).optional(),
    TELEGRAM_CHANNEL: z.string().min(1).optional(),

    TELEGRAM_API_ID: z.number().optional(),
    TELEGRAM_API_HASH: z.string().min(10).optional(),
    TELEGRAM_SESSION: z.string().min(10).optional(),

  },
  client: {
    NEXT_PUBLIC_TESTNET: z.boolean().default(false),
    NEXT_PUBLIC_SITE_URL: z.string().default("http://localhost:3000"),
    NEXT_PUBLIC_SOCKET_URL: z.string().default("http://localhost:3001"),
    NEXT_PUBLIC_NOTIFY_URL: z.string().default("http://localhost:3050"),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_SOCKET_CORS_ORIGIN: z.string().default("http://localhost:3000"),
    // Default to empty string so Docker builds don't fail when the env var is missing; real deployments should override.
    NEXT_PUBLIC_NOTIFY_PAIRING_URL: z.string().default(""),
    NEXT_PUBLIC_AA_ADDRESS: z.string().min(4).default("CURJWJ2TQ36NBHVYVPIXEKKN4QNI43BT"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TESTNET: Boolean(process.env.NEXT_PUBLIC_TESTNET),
    NEXT_PUBLIC_AA_ADDRESS: process.env.NEXT_PUBLIC_AA_ADDRESS,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SOCKET_CORS_ORIGIN: process.env.NEXT_PUBLIC_SOCKET_CORS_ORIGIN,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_NOTIFY_URL: process.env.NEXT_PUBLIC_NOTIFY_URL,
    NEXT_PUBLIC_NOTIFY_PAIRING_URL: process.env.NEXT_PUBLIC_NOTIFY_PAIRING_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    WS_NO_BUFFER_UTIL: process.env.WS_NO_BUFFER_UTIL ? Number(process.env.WS_NO_BUFFER_UTIL) : undefined,
    WS_NO_UTF_8_VALIDATE: process.env.WS_NO_UTF_8_VALIDATE ? Number(process.env.WS_NO_UTF_8_VALIDATE) : undefined,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,

    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHANNEL: process.env.TELEGRAM_CHANNEL,

    TELEGRAM_API_ID: process.env.TELEGRAM_API_ID
      ? Number(process.env.TELEGRAM_API_ID)
      : undefined,
    TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH,
    TELEGRAM_SESSION: process.env.TELEGRAM_SESSION,
  }
});
