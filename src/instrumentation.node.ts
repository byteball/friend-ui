import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

export async function register() {
  const getAllStateVars = (await import('./lib/get-all-state-vars')).default;
  const getObyteClient = (await import('./lib/get-obyte-client')).default;

  console.log("log(bootstrap): Start bootstrapping...");

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  if (!client) throw new Error("Obyte client is not available");

  client.onConnect(async () => {
    // load all stateVars
    const initState: IAaState = await getAllStateVars(client, appConfig.AA_ADDRESS);
    let initGovernanceState: Record<string, any> = {};

    console.log('log(bootstrap): all frd state vars are loaded', Object.entries(initState).length);

    const constants = initState.constants ? initState.constants : undefined;

    await client.justsaying("light/new_aa_to_watch", {
      aa: appConfig.AA_ADDRESS
    });

    console.log('log(bootstrap): watching main AA', appConfig.AA_ADDRESS);

    if (constants?.governance_aa) {
      await client.justsaying("light/new_aa_to_watch", {
        aa: constants.governance_aa
      });

      initGovernanceState = await getAllStateVars(client, constants.governance_aa);

      console.log('log(bootstrap): all governance state vars are loaded', Object.entries(initGovernanceState).length);

      console.log('log(bootstrap): watching governance AA', constants.governance_aa);
    }

    const initTokens: Record<string, TokenMeta> = { base: { asset: 'base', symbol: 'GBYTE', decimals: 9 } };
    const assets: string[] = [];

    Object.keys(initState).forEach(key => {
      if (key.startsWith('deposit_asset_')) {
        const asset = key.slice(14);
        assets.push(asset);
      }
    });

    const tokenRegistry = client.api.getOfficialTokenRegistryAddress();

    // tokens from config
    for (const asset of assets) {
      if (asset === "base") continue;

      const [symbol, decimals] = await Promise.all([
        client.api.getSymbolByAsset(tokenRegistry, asset),
        client.api.getDecimalsBySymbolOrAsset(tokenRegistry, asset)
      ]);

      initTokens[asset] = { asset, symbol, decimals };
    }

    console.log('log(bootstrap): all tokens are loaded', Object.entries(initTokens).length);

    if (constants?.asset) {
      const [symbol, decimals] = await Promise.all([
        client.api.getSymbolByAsset(tokenRegistry, constants.asset),
        client.api.getDecimalsBySymbolOrAsset(tokenRegistry, constants.asset)
      ]);

      initTokens[constants.asset] = { asset: constants.asset, symbol, decimals };
    } else {
      console.warn('warn(bootstrap): constants missing, skip FRD token meta');
      throw new Error("Constants missing. Please issue FRD asset first.");
    }

    console.log('log(bootstrap): loading FRD metadata completed, initializing GlobalStore');

    // init store emitter once
    if (!globalThis.__GLOBAL_STORE__) {
      const globalStoreImport = await import('./global-store');

      globalThis.__GLOBAL_STORE__ = new globalStoreImport.GlobalStore({
        initState,
        initTokens,
        initGovernanceState
      });
    } else {
      // re-initialize state and tokens
      globalThis.__GLOBAL_STORE__.initializeState(initState);
      globalThis.__GLOBAL_STORE__.initializeTokens(initTokens);
      globalThis.__GLOBAL_STORE__.initializeGovernanceState(initGovernanceState);
    }

    if (globalThis.__GLOBAL_STORE__.ready) {
      console.log("log(bootstrap): GlobalStore is ready");
    } else {
      console.error("error(bootstrap): GlobalStore failed to initialize");
    }
  });
}
