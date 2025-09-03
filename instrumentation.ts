import { LRUCache } from 'lru-cache';

import { getObyteClient } from './services/getObyteClient';

import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

export async function register() {
  console.log("Start bootstrapping...");

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  // init storages

  globalThis.__SYMBOL_STORAGE__ = new LRUCache<string, TokenMeta>({
    max: 500,
    ttl: 0,
  });

  client.onConnect(async () => {
    console.log("Bootstrapping completed.");

    // base symbol
    globalThis.__SYMBOL_STORAGE__.set('base', { asset: 'base', symbol: 'GBYTE', decimals: 9 });

    // symbols from config
    for (const asset of appConfig.ALLOWED_TOKEN_ASSETS) {
      if (asset === "base") continue;

      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
      const symbol = await client.api.getSymbolByAsset(tokenRegistry, asset);
      const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset);

      globalThis.__SYMBOL_STORAGE__.set(asset, { asset, symbol, decimals });
    }

    console.log('log(bootstrap): all symbols are loaded', globalThis.__SYMBOL_STORAGE__.size);

    console.error('symbolStorage:', globalThis.__SYMBOL_STORAGE__.get("base"));
  });
}