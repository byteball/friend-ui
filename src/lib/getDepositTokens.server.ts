"use server";
import "server-only";

import { appConfig } from "@/appConfig";

export const getDepositTokens = async () => {
  // The instrumentation/bootstrap might not have run yet on the very first request.
  // In that case, avoid calling `.get` on an undefined store and return sensible fallbacks.
  const tokens = globalThis.__GLOBAL_STORE__?.getTokens() ?? {};

  return appConfig.ALLOWED_TOKEN_ASSETS.map<TokenMeta | undefined>((asset) => {
    // If the store exists, just read from it.
    if (asset in tokens) return tokens[asset];

    // Fallback: at least expose base token so the UI can render.
    if (asset === "base") {
      return { asset: "base", symbol: "GBYTE", decimals: 9 } as const;
    }

    // Others are not ready yet.
    return undefined;
  });
};