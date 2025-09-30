import { appConfig } from '@/appConfig';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;

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
          const governanceStateDiff: Record<string, any> = {};

          if (updatedStateVars && Object.keys(updatedStateVars).length > 0) {
            for (const address in updatedStateVars) {
              for (const var_name in updatedStateVars[address]) {
                if (address === appConfig.AA_ADDRESS) {
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

    // @ts-expect-error no error
    globalThis.__OBYTE_CLIENT__.client.ws.addEventListener("close", () => {
      clearInterval(globalThis.__OBYTE_HEARTBEAT__);
    });

    console.error('log(bootstrap): connected to Obyte client');
  });


  return globalThis.__OBYTE_CLIENT__;
}

export default getObyteClient;