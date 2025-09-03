"use server";
import "server-only";

import { appConfig } from "@/appConfig";

export const runtime = 'nodejs';

const AUTO_RECONNECT = true;
const HEARTBEAT_INTERVAL = 10 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __OBYTE_CLIENT__: Obyte.Client | undefined;
  // eslint-disable-next-line no-var
  var __OBYTE_HEARTBEAT__: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var 
  var __OBYTE_CONNECTS_TOTAL__: number | undefined;
}

export const getObyteClient = async () => {
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