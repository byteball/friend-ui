import { appConfig } from '@/appConfig';

export const runtime = 'nodejs';

declare global {
  // eslint-disable-next-line no-var
  var __OBYTE_CLIENT__: any | undefined;
  // eslint-disable-next-line no-var
  var __OBYTE_HEARTBEAT__: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var 
  var __OBYTE_CONNECTS_TOTAL__: number | undefined;
}

export async function register() {
  console.log("Start bootstrapping...");

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!globalThis.__OBYTE_CLIENT__) {
      const obyte = await import('obyte');

      const client = new obyte.Client(`wss://obyte.org/bb${appConfig.TESTNET ? "-test" : ""}`, {
        testnet: appConfig.TESTNET,
        reconnect: true,
      });

      globalThis.__OBYTE_CLIENT__ = client;
      globalThis.__OBYTE_CONNECTS_TOTAL__ = globalThis.__OBYTE_CONNECTS_TOTAL__ ?? 0;

      client.onConnect(() => {
        // Count total (re)connections in this process
        globalThis.__OBYTE_CONNECTS_TOTAL__ = (globalThis.__OBYTE_CONNECTS_TOTAL__ ?? 0) + 1;

        // Ensure a single heartbeat instance
        if (globalThis.__OBYTE_HEARTBEAT__) {
          clearInterval(globalThis.__OBYTE_HEARTBEAT__);
          globalThis.__OBYTE_HEARTBEAT__ = undefined;
        }
        globalThis.__OBYTE_HEARTBEAT__ = setInterval(() => {
          try {
            client.api.heartbeat();
          } catch (err) {
            console.warn('Obyte heartbeat error:', err);
          }
        }, 10 * 1000);

        // Clear heartbeat on WebSocket close (support both browser and Node ws)
        const ws: any = (client as any).client?.ws;
        const onClose = () => {
          if (globalThis.__OBYTE_HEARTBEAT__) {
            clearInterval(globalThis.__OBYTE_HEARTBEAT__);
            globalThis.__OBYTE_HEARTBEAT__ = undefined;
          }
          console.log('Obyte disconnected');
          if (ws?.removeEventListener) ws.removeEventListener('close', onClose);
          else if (ws?.off) ws.off('close', onClose);
        };
        if (ws?.addEventListener) ws.addEventListener('close', onClose);
        else if (ws?.on) ws.on('close', onClose);

        console.log(`Connected to Obyte. Total connects: ${globalThis.__OBYTE_CONNECTS_TOTAL__}`);
      });
    } else {
      console.log('Reusing existing Obyte client (singleton).');
    }

  } else {
    console.error("Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  console.log("Bootstrapping completed.");
}