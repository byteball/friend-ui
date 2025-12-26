import { appConfig } from '@/app-config';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;

const getObyteClient = async () => {
  if (globalThis.__OBYTE_CLIENT__) return globalThis.__OBYTE_CLIENT__;

  const obyte = await import('obyte');

  globalThis.__OBYTE_CLIENT__ = new obyte.Client(`wss://obyte.org/bb${appConfig.TESTNET ? "-test" : ""}`, {
    testnet: appConfig.TESTNET,
    reconnect: AUTO_RECONNECT
  });

  // Prevent multiple subscribe() calls on HMR or reconnect
  if (!globalThis.__OBYTE_SUBSCRIBED__) {
    globalThis.__OBYTE_SUBSCRIBED__ = true;

    globalThis.__OBYTE_CLIENT__.subscribe((err, result) => {
      if (err) {
        console.error("error(bootstrap): WebSocket problem", err);
        return;
      }

      const { subject } = result[1];

      switch (subject) {
        case "exchange_rates": {
          const rates = result[1].body;

          if (globalThis.__GLOBAL_STORE__ && rates) {
            globalThis.__GLOBAL_STORE__.gbytePriceUSD = rates['GBYTE_USD'] || 0;
            console.error('log(bootstrap): updated GBYTE price', globalThis.__GLOBAL_STORE__.gbytePriceUSD);
          }

          break;
        }
        case "light/aa_request":
          console.error("warn(bootstrap): aa_request not handled");
          // aaRequestHandler(err, result);
          break;
        case "light/aa_response": {
          const { body } = result[1];
          const { updatedStateVars, timestamp } = body;

          console.log('log(bootstrap): new aa_response', timestamp);
          const aaStateDiff: IAaState = {};
          const governanceStateDiff: Record<string, any> = {};

          if (updatedStateVars && Object.keys(updatedStateVars).length > 0) {
            for (const address in updatedStateVars) {
              for (const var_name in updatedStateVars[address]) {
                if (address === appConfig.AA_ADDRESS) {
                  if (var_name.startsWith('deposit_asset_')) {
                    const asset = var_name.split("_")?.[2];

                    if (asset) {
                      globalThis.__GLOBAL_STORE__?.addTokenToList(updatedStateVars[address][var_name].value);
                    }
                  }

                  aaStateDiff[var_name] = updatedStateVars[address][var_name].value;
                } else {
                  governanceStateDiff[var_name] = updatedStateVars[address][var_name].value;
                }
              }
            }
          }

          if (Object.keys(aaStateDiff).length > 0) {
            console.log('log(bootstrap): state diff', aaStateDiff);
            globalThis.__GLOBAL_STORE__?.updateState(aaStateDiff);
          }

          if (Object.keys(governanceStateDiff).length > 0) {
            console.log('log(bootstrap): governance state diff', governanceStateDiff);
            globalThis.__GLOBAL_STORE__?.updateGovernanceState(governanceStateDiff);
          }

          break;
        }

      }
    });

    console.log('log(bootstrap): Obyte client subscribed to events');
  }

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

    // Remove previous close listener if exists to prevent duplicates
    if (globalThis.__OBYTE_WS_CLOSE_HANDLER__) {
      // @ts-expect-error no error
      globalThis.__OBYTE_CLIENT__.client.ws.removeEventListener("close", globalThis.__OBYTE_WS_CLOSE_HANDLER__);
    }

    // Store the handler reference for cleanup
    globalThis.__OBYTE_WS_CLOSE_HANDLER__ = () => {
      clearInterval(globalThis.__OBYTE_HEARTBEAT__);
    };

    // @ts-expect-error no error
    globalThis.__OBYTE_CLIENT__.client.ws.addEventListener("close", globalThis.__OBYTE_WS_CLOSE_HANDLER__);

    console.error('log(bootstrap): connected to Obyte client');
  });


  return globalThis.__OBYTE_CLIENT__;
}

export default getObyteClient;