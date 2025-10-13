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
    NEXT_PUBLIC_AA_ADDRESS: z.string().min(4).default("CURJWJ2TQ36NBHVYVPIXEKKN4QNI43BT"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TESTNET: Boolean(process.env.NEXT_PUBLIC_TESTNET),
    NEXT_PUBLIC_AA_ADDRESS: process.env.NEXT_PUBLIC_AA_ADDRESS,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    WS_NO_BUFFER_UTIL: process.env.WS_NO_BUFFER_UTIL ? Number(process.env.WS_NO_BUFFER_UTIL) : undefined,
    WS_NO_UTF_8_VALIDATE: process.env.WS_NO_UTF_8_VALIDATE ? Number(process.env.WS_NO_UTF_8_VALIDATE) : undefined
  }
});
