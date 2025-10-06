"use client";
"use no memo";

import { appConfig } from "@/appConfig";
import httpClient from "@/lib/httpClient";
import { useCallback, useEffect, useState } from "react";

/** In-memory cache with TTL */
type CacheEntry = { value: string; expiresAt: number };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

/** Read cache safely */
function readCache(asset: string): string | null {
  const entry = cache.get(asset);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(asset);
    return null;
  }
  return entry.value;
}

/** Write cache */
function writeCache(asset: string, value: string) {
  cache.set(asset, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export const useSymbol = (asset: string) => {
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState(`${asset.slice(0, 6)}...`);
  const [error, setError] = useState(null);

  const fetchSymbol = useCallback(async (asset: string) => {
    const existingCache = readCache(asset)
    console.log('existingCache', existingCache)
    if (asset === 'base') {
      setSymbol('GBYTE');
      setLoading(false);
      return;
    } else if (existingCache) {
      const smb = existingCache;

      setSymbol(smb);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const smb = await httpClient.getAaStateVars(appConfig.TOKEN_REGISTRY_AA, `a2s_${asset}`)
        .then(res => res?.[`a2s_${asset}`]);

      if (smb) {
        writeCache(asset, smb);
        setSymbol(smb);
      }

      setError(null);
    } catch (error) {
      setError(error as any);
      console.error("Failed to fetch symbol for asset", asset, error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSymbol, setError]);

  useEffect(() => {
    fetchSymbol(asset);
  }, [asset, fetchSymbol])

  return { symbol, loading, error };
}