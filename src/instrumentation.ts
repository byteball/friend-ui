import { LRUCache } from 'lru-cache';

import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;

export async function register() {
  console.log("Start bootstrapping...");

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  globalThis.__SYMBOL_STORAGE__ = new LRUCache<string, TokenMeta>({
    max: 500,
    ttl: 0,
  });

  globalThis.__STATE_VARS_STORAGE__ = new LRUCache<string, any>({
    max: 10000,
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

const getObyteClient = async () => {
  if (globalThis.__OBYTE_CLIENT__) return globalThis.__OBYTE_CLIENT__;

  const obyte = await import('obyte');

  globalThis.__OBYTE_CLIENT__ = new obyte.Client(`wss://obyte.org/bb${appConfig.TESTNET ? "-test" : ""}`, {
    testnet: appConfig.TESTNET,
    reconnect: AUTO_RECONNECT
  });

  globalThis.__OBYTE_CLIENT__.onConnect(async () => {

    // clear existing heartbeat if any
    if (globalThis.__OBYTE_HEARTBEAT__) {
      clearInterval(globalThis.__OBYTE_HEARTBEAT__);
      globalThis.__OBYTE_HEARTBEAT__ = undefined;
    }


    globalThis.__OBYTE_HEARTBEAT__ = setInterval(async () => {
      if (!globalThis.__OBYTE_CLIENT__) {
        console.error("error(heartbeat): obyte client missing");
        return;
      }

      try {
        await globalThis.__OBYTE_CLIENT__.api.heartbeat();
        console.error('log: heartbeat');
      } catch (err) {
        console.error('error: heartbeat error:', err);
      }
    }, HEARTBEAT_INTERVAL);

    // @ts-ignore
    globalThis.__OBYTE_CLIENT__.client.ws.addEventListener("close", () => {
      clearInterval(globalThis.__OBYTE_HEARTBEAT__);
    });

    console.error('log: connected to Obyte client');
  });


  return globalThis.__OBYTE_CLIENT__;
}