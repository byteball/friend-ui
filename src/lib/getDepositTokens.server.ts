"use server";
import "server-only";

import { appConfig } from "@/appConfig";

export const getDepositTokens = async () => {
  // The instrumentation/bootstrap might not have run yet on the very first request.
  // In that case, avoid calling `.get` on an undefined store and return sensible fallbacks.
  const store = globalThis.__SYMBOL_STORAGE__;

  return appConfig.ALLOWED_TOKEN_ASSETS.map<TokenMeta | undefined>((asset) => {
    // If the store exists, just read from it.
    if (store) return store.get(asset);

    // Fallback: at least expose base token so the UI can render.
    if (asset === "base") {
      return { asset: "base", symbol: "GBYTE", decimals: 9 } as const;
    }

    // Others are not ready yet.
    return undefined;
  });
};