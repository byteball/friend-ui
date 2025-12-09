import { NextRequest } from 'next/server';

import { appConfig } from '@/app-config';
import { STORE_EVENTS } from '@/constants';
import { createSSEHandler } from 'use-next-sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SSE_HEARTBEAT_MS = 15_000; // keep-alive to prevent idle disconnects

const EMPTY_SNAPSHOT: IClientSnapshot = {
  state: {},
  governanceState: {},
  tokens: {},
  params: appConfig.initialParamsVariables,
};

const sseHandler = createSSEHandler((send, _close, { onClose }) => {
  const store = globalThis.__GLOBAL_STORE__;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  const listeners: Array<[STORE_EVENTS, (...args: any[]) => void]> = [];

  // --- SAFE WRAPPER FOR LISTENERS ---
  const safe = <T extends (...args: any[]) => void>(fn: T): T =>
  (((...args: any[]) => {
    try {
      fn(...args);
    } catch (err) {
      console.warn('[SSE listener error]', err);
    }
  }) as T);

  const push = (event: STORE_EVENTS | string, payload: unknown) => {
    try {
      send({ event, data: payload });
    } catch (err) {
      console.warn('[SSE] send error', err);
    }
  };

  const cleanup = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }

    if (store) {
      for (const [event, handler] of listeners) {
        try {
          store.off?.(event, handler);
          store.removeListener?.(event, handler);
        } catch (err) {
          console.warn('[SSE cleanup listener error]', err);
        }
      }
    }
  };

  onClose(cleanup);

  const snapshot = store?.getSnapshot?.() ?? EMPTY_SNAPSHOT;
  push(STORE_EVENTS.SNAPSHOT, snapshot);

  if (store) {
    const snapshotListener = safe((payload: IClientSnapshot) => push(STORE_EVENTS.SNAPSHOT, payload));
    const stateListener = safe((payload: IAaState) => push(STORE_EVENTS.STATE_UPDATE, payload));
    const governanceListener = safe((payload: Record<string, any>) => push(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload));

    store.on(STORE_EVENTS.SNAPSHOT, snapshotListener);
    store.on(STORE_EVENTS.STATE_UPDATE, stateListener);
    store.on(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, governanceListener);

    listeners.push([STORE_EVENTS.SNAPSHOT, snapshotListener]);
    listeners.push([STORE_EVENTS.STATE_UPDATE, stateListener]);
    listeners.push([STORE_EVENTS.GOVERNANCE_STATE_UPDATE, governanceListener]);
  }

  heartbeat = setInterval(() => {
    push('HEARTBEAT', { ts: Date.now() });
  }, SSE_HEARTBEAT_MS);

  return cleanup;
});

export async function GET(request: NextRequest) {
  const response = await sseHandler(request);
  response.headers.set('X-Accel-Buffering', 'no');
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Connection', 'keep-alive');
  response.headers.set('Keep-Alive', 'timeout=25, max=100');
  response.headers.set('Alt-Svc', 'clear');
  response.headers.set('x-vercel-disable-http3', '1');
  return response;
}
