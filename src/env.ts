import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_TESTNET: z.boolean().default(true),
    NEXT_PUBLIC_AA_ADDRESS: z.string().min(4).default("FQQLTDJGGTXKCOHYOR4RZYHN2VE3QZ72"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TESTNET: process.env.NEXT_PUBLIC_TESTNET,
    NEXT_PUBLIC_AA_ADDRESS: process.env.NEXT_PUBLIC_AA_ADDRESS,
  }
});
