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

  const push = (event: STORE_EVENTS | string, payload: unknown) => {
    try {
      send({ event, data: payload });
    } catch (err) {
      // if (process.env.NODE_ENV !== 'production') {
        console.warn('[SSE] send error', err);
      // }
    }
  };

  const cleanup = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }

    if (store) {
      for (const [event, handler] of listeners) {
        if (typeof store.off === 'function') {
          store.off(event, handler);
        } else if (typeof store.removeListener === 'function') {
          store.removeListener(event, handler);
        }
      }
    }
  };

  onClose(cleanup);

  const snapshot = store?.getSnapshot?.() ?? EMPTY_SNAPSHOT;
  push(STORE_EVENTS.SNAPSHOT, snapshot);

  if (store) {
    const snapshotListener = (payload: IClientSnapshot) => push(STORE_EVENTS.SNAPSHOT, payload);
    const stateListener = (payload: IAaState) => push(STORE_EVENTS.STATE_UPDATE, payload);
    const governanceListener = (payload: Record<string, any>) => push(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload);

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
  return response;
}
