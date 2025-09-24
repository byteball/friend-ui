import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;
const MAX_STATE_VARS_LOAD_ITERATIONS = 100 as const; // Safety limit

export async function register() {
  console.log("log(bootstrap): Start bootstrapping...");

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  client.onConnect(async () => {


    // load all stateVars
    let initState: IAaState = {};
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
          initState = { ...initState, ...chunkData };
          lastKey = keys[keys.length - 1];
        } else {
          break;
        }
      }
    } catch (e) {
      console.error("error(bootstrap): can't load state vars", e);
      // Don't terminate the process in Next.js; continue without state vars
    }

    console.log('log(bootstrap): all state vars are loaded', Object.entries(initState).length);

    const constants = initState.constants ? initState.constants : undefined;

    const initTokens: Record<string, TokenMeta> = { base: { asset: 'base', symbol: 'GBYTE', decimals: 9 } };
    const assets: string[] = [];

    Object.keys(initState).forEach(key => {
      if (key.startsWith('deposit_asset_')) {
        const asset = key.slice(14);
        assets.push(asset);
      }
    });

    // tokens from config
    for (const asset of assets) {
      if (asset === "base") continue;

      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
      const symbol = await client.api.getSymbolByAsset(tokenRegistry, asset);
      const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset);

      initTokens[asset] = { asset, symbol, decimals };
    }

    console.log('log(bootstrap): all tokens are loaded', Object.entries(initTokens).length);

    if (constants?.asset) {
      const tokenRegistry = client.api.getOfficialTokenRegistryAddress();
      const symbol = await client.api.getSymbolByAsset(tokenRegistry, constants.asset);
      const decimals = await client.api.getDecimalsBySymbolOrAsset(tokenRegistry, constants.asset);

      initTokens[constants.asset] = { asset: constants.asset, symbol, decimals };
    } else {
      console.warn('warn(bootstrap): constants missing, skip FRD token meta');
    }

    console.log('log(bootstrap): loading FRD metadata completed, initializing GlobalStore');

    if (process.env.NEXT_RUNTIME !== 'nodejs') {
      console.error("log(bootstrap): Ignore unsupported runtime");
      return;
    }

    // init store emitter once
    if (!globalThis.__GLOBAL_STORE__) {
      const globalStoreImport = await import('./GlobalStore');

      globalThis.__GLOBAL_STORE__ = new globalStoreImport.GlobalStore({
        initState,
        initTokens
      });
    } else {
      // re-initialize state and tokens
      globalThis.__GLOBAL_STORE__.initializeState(initState);
      globalThis.__GLOBAL_STORE__.initializeTokens(initTokens);
    }

    console.log("log(bootstrap): GlobalStore is ready", globalThis.__GLOBAL_STORE__.ready);
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

    if (!globalThis.__OBYTE_CLIENT__) {
      console.error("error(bootstrap): obyte client missing");
      return;
    }

    await globalThis.__OBYTE_CLIENT__.justsaying("light/new_aa_to_watch", {
      aa: appConfig.AA_ADDRESS
    });

    globalThis.__OBYTE_CLIENT__.subscribe((err, result) => {
      if (err) {
        console.error("error(bootstrap): WebSocket problem", err);
        return;
      }

      const { subject } = result[1];

      switch (subject) {
        case "light/aa_request":
          console.error("warn(bootstrap): aa_request not handled");
          // aaRequestHandler(err, result);
          break;
        case "light/aa_response": {
          const { body } = result[1];
          const { updatedStateVars, timestamp } = body;

          console.log('log(bootstrap): new aa_response', timestamp);
          const aaStateDiff: IAaState = {};

          if (updatedStateVars && Object.keys(updatedStateVars).length > 0) {
            for (const address in updatedStateVars) {
              for (const var_name in updatedStateVars[address]) {
                if (address === appConfig.AA_ADDRESS) {
                  aaStateDiff[var_name] = updatedStateVars[address][var_name].value;
                } else {
                  // TODO: add support for other AA addresses if needed (GOVERNANCE)
                }
              }
            }
          }

          if (Object.keys(aaStateDiff).length > 0) {
            console.log('log(bootstrap): state diff', aaStateDiff);
            globalThis.__GLOBAL_STORE__?.updateState(aaStateDiff);
          }

          break;
        }

      }
    });

    globalThis.__OBYTE_HEARTBEAT__ = setInterval(async () => {
      if (!globalThis.__OBYTE_CLIENT__) {
        console.error("error(heartbeat): obyte client missing");
        return;
      }

      try {
        await globalThis.__OBYTE_CLIENT__.api.heartbeat();
        // console.error('log: heartbeat');
      } catch (err) {
        console.error('error(bootstrap): heartbeat error:', err);
      }
    }, HEARTBEAT_INTERVAL);

    // @ts-ignore
    globalThis.__OBYTE_CLIENT__.client.ws.addEventListener("close", () => {
      clearInterval(globalThis.__OBYTE_HEARTBEAT__);
    });

    console.error('log(bootstrap): connected to Obyte client');
  });


  return globalThis.__OBYTE_CLIENT__;
}