"use server";
import "server-only";

import { appConfig } from "@/appConfig";

export const getDepositTokens = async () => {
  return appConfig.ALLOWED_TOKEN_ASSETS.map((asset) => {
    return globalThis.__SYMBOL_STORAGE__.get(asset) ?? [];
  });
};