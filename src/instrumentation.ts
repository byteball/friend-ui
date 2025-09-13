import { EventEmitter } from 'events';

import { LRUCache } from 'lru-cache';

import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;
const MAX_STATE_VARS_LOAD_ITERATIONS = 100 as const; // Safety limit

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

  // init shared emitter once
  if (!globalThis.__DATA_EVENT_EMITTER__) {
    globalThis.__DATA_EVENT_EMITTER__ = new EventEmitter();
    // avoid memory leak warnings — we control listeners
    globalThis.__DATA_EVENT_EMITTER__.setMaxListeners(1000);
  }

  const emitSnapshot = () => {
    try {
      const payload = {
        state: Object.fromEntries(globalThis.__STATE_VARS_STORAGE__!.entries()),
        symbols: Object.fromEntries(globalThis.__SYMBOL_STORAGE__!.entries()),
      } satisfies IClientData;
      globalThis.__DATA_EVENT_EMITTER__!.emit('snapshot', payload);
    } catch (e) {
      console.error('error(emitter): failed to emit snapshot', e);
    }
  };

  client.onConnect(async () => {
    console.log("Bootstrapping completed.");

    // base symbol
    const symSet = globalThis.__SYMBOL_STORAGE__.set.bind(globalThis.__SYMBOL_STORAGE__);
    const stateSet = globalThis.__STATE_VARS_STORAGE__.set.bind(globalThis.__STATE_VARS_STORAGE__);

    const setSymbol = (k: string, v: TokenMeta) => {
      symSet(k, v);
      emitSnapshot();
    };
    const setStateVar = (k: string, v: any) => {
      stateSet(k, v);
      emitSnapshot();
    };

    setSymbol('base', { asset: 'base', symbol: 'GBYTE', decimals: 9 });

    // symbols from config
    for (const asset of appConfig.ALLOWED_TOKEN_ASSETS) {
      if (asset === "base") continue;

      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
      const symbol = await client.api.getSymbolByAsset(tokenRegistry, asset);
      const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset);

      setSymbol(asset, { asset, symbol, decimals });
    }

    console.log('log(bootstrap): all symbols are loaded', globalThis.__SYMBOL_STORAGE__.size);

    // load all stateVars

    let aaState: object = {};
    let iteration = 0;

    // TODO: WARNING: You should have more than 1 state vars

    try {
      let lastKey = "";

      while (true) {
        if (iteration++ > MAX_STATE_VARS_LOAD_ITERATIONS) {
          throw new Error(`Reached maximum iterations (${MAX_STATE_VARS_LOAD_ITERATIONS}) when fetching AA state vars`);
        }

        let chunkData: object = {};

        chunkData = (await client.api.getAaStateVars({
          address: appConfig.AA_ADDRESS,
          // @ts-expect-error
          var_prefix_from: lastKey,
        })) as object;

        const keys = Object.keys(chunkData);

        if (keys.length > 1) {
          aaState = { ...aaState, ...chunkData };
          lastKey = keys[keys.length - 1];
        } else {
          break;
        }
      }
    } catch (e) {
      console.error("error(bootstrap): can't load state vars", e);
      // Don't terminate the process in Next.js; continue without state vars
    }

    for (const [key, value] of Object.entries(aaState)) {
      setStateVar(key, value);
    }

    // load FRD token meta (if constants available)
    const constants = globalThis.__STATE_VARS_STORAGE__.get('constants');
    if (constants?.asset) {
      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
      const symbol = await client.api.getSymbolByAsset(tokenRegistry, constants.asset);
      const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, constants.asset);
      setSymbol(constants.asset, { asset: constants.asset, symbol, decimals });
    } else {
      console.warn('warn(bootstrap): constants missing, skip FRD token meta');
    }

    console.error('log(bootstrap): all state vars are loaded', globalThis.__STATE_VARS_STORAGE__.size);
    emitSnapshot();

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