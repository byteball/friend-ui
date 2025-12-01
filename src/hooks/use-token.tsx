"use client";
"use no memo";

import { appConfig } from "@/app-config";
import { getAaStateVars } from "@/lib/http-client";
import { useEffect, useState } from "react";

/** In-memory cache with TTL */
type TokenMapping = { asset: string; symbol: string };
type CacheEntry = { value: TokenMapping; expiresAt: number };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

const BASE_ASSET = "base";
const BASE_SYMBOL = "GBYTE";
const DEBOUNCE_MS = 300; // debounce delay for lookups

interface Options {
  allowNull?: boolean;
  debounce?: number; // custom debounce delay in ms
}

const buildCacheKey = (kind: "asset" | "symbol", value: string) => `${kind}:${value}`;

const readCache = (kind: "asset" | "symbol", value: string): TokenMapping | null => {
  const key = buildCacheKey(kind, value);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const writeCache = ({ asset, symbol }: TokenMapping) => {
  const expiresAt = Date.now() + CACHE_TTL_MS;
  cache.set(buildCacheKey("asset", asset), { value: { asset, symbol }, expiresAt });
  cache.set(buildCacheKey("symbol", symbol), { value: { asset, symbol }, expiresAt });
};

type TokenInput = { symbol: string } | { asset: string };
type TokenState = { asset: string | null; symbol: string | null };

const resolveDefaults = (kind: "asset" | "symbol", value: string | null) => {
  if (kind === "asset") {
    if (!value) return { asset: null, symbol: null, resolved: false };
    if (value === BASE_ASSET) {
      return { asset: BASE_ASSET, symbol: BASE_SYMBOL, resolved: true };
    }
    return { asset: value, symbol: null, resolved: false };
  }

  if (!value) return { asset: null, symbol: null, resolved: false };
  if (value === BASE_SYMBOL) {
    return { asset: BASE_ASSET, symbol: BASE_SYMBOL, resolved: true };
  }

  return { asset: null, symbol: value, resolved: false };
};

export const useToken = (input: TokenInput, options?: Options) => {
  const allowNull = options?.allowNull ?? false;
  const debounceDelay = options?.debounce ?? DEBOUNCE_MS;

  const isAssetLookup = "asset" in input;
  const kind: "asset" | "symbol" = isAssetLookup ? "asset" : "symbol";
  const rawValue = isAssetLookup ? input.asset : input.symbol;
  const normalized = typeof rawValue === "string" ? rawValue.trim() : "";
  const lookupValue = normalized ? (kind === "symbol" ? normalized.toUpperCase() : normalized) : null;

  const defaults = resolveDefaults(kind, lookupValue);

  const [token, setToken] = useState<TokenState>({ asset: defaults.asset, symbol: defaults.symbol });
  const [loading, setLoading] = useState<boolean>(() => Boolean(lookupValue) && !defaults.resolved);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken({ asset: defaults.asset, symbol: defaults.symbol });

    if (!lookupValue) {
      setLoading(false);
      if (!allowNull) setError(null);
      return;
    }

    if (defaults.resolved && defaults.asset && defaults.symbol) {
      writeCache({ asset: defaults.asset, symbol: defaults.symbol });
      setLoading(false);
      setError(null);
      return;
    }

    const cached = readCache(kind, lookupValue);
    if (cached) {
      setToken(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Debounce the network request
    const timer = setTimeout(() => {
      if (cancelled) return;

      const stateVarKey = kind === "asset" ? `a2s_${lookupValue}` : `s2a_${lookupValue}`;

      getAaStateVars(appConfig.TOKEN_REGISTRY_AA, stateVarKey)
        .then((res) => {
          if (cancelled) return;
          const fetchedValue = res?.[stateVarKey];

          if (!fetchedValue) {
            if (!allowNull) {
              setError("Token is not registered in the token registry");
            }

            setToken((prev) => ({
              asset: kind === "asset" ? lookupValue : prev.asset,
              symbol: kind === "symbol" ? lookupValue : prev.symbol,
            }));
            return;
          }

          const mapping: TokenMapping =
            kind === "asset"
              ? { asset: lookupValue, symbol: fetchedValue as string }
              : { asset: fetchedValue as string, symbol: lookupValue };

          writeCache(mapping);
          setToken(mapping);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("Failed to resolve token", lookupValue, err);
          setError(err instanceof Error ? err.message : "Failed to resolve token");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, debounceDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [allowNull, debounceDelay, defaults.asset, defaults.symbol, defaults.resolved, kind, lookupValue]);

  return { ...token, loading, error };
};
