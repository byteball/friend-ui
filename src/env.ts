import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    WS_NO_BUFFER_UTIL: z.number().default(1),
    WS_NO_UTF_8_VALIDATE: z.number().default(1),
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
    WS_NO_UTF_8_VALIDATE: process.env.WS_NO_UTF_8_VALIDATE ? Number(process.env.WS_NO_UTF_8_VALIDATE) : undefined
  }
});
