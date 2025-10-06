"use client";
"use no memo";

import { appConfig } from "@/appConfig";
import httpClient from "@/lib/httpClient";
import { useCallback, useEffect, useState } from "react";

/** In-memory cache with TTL */
type CacheEntry = { value: string; expiresAt: number };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

interface Options {
  allowNull?: boolean;
}

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


export const useSymbol = (asset: string, options?: Options) => {
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState(options?.allowNull ? null : `${asset.slice(0, 6)}...`);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      return;
    } else if (asset.length !== 44) {
      setSymbol(options?.allowNull ? null : `${asset.slice(0, 6)}...`);
      setLoading(false);
      setError("Invalid asset");
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
  }, [setLoading, setSymbol, setError, options]);

  useEffect(() => {
    fetchSymbol(asset);
  }, [asset, fetchSymbol])

  return { symbol, loading, error };
}