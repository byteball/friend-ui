import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { STORE_EVENTS } from '@/constants';

function formatSse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  let onSnapshot: ((payload: IClientSnapshot) => void) | null = null;
  let onStateUpdate: ((payload: IAaStore) => void) | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const safeEnqueue = (text: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // controller likely closed; stop further writes
          closed = true;
          if (heartbeat) clearInterval(heartbeat);
        }
      };

      const sendToClient = (data: unknown) => safeEnqueue(formatSse(data));

      heartbeat = setInterval(() => safeEnqueue(': keepalive\n\n'), 15000);

      const initialSnapshot = globalThis.__GLOBAL_STORE__?.getSnapshot() || { state: {}, tokens: {} };

      sendToClient({ event: STORE_EVENTS.SNAPSHOT, data: initialSnapshot }); // send initial snapshot

      onSnapshot = (payload: IClientSnapshot) => {
        sendToClient({ event: STORE_EVENTS.SNAPSHOT, data: payload });
      }

      onStateUpdate = (payload: IAaStore) => {
        sendToClient({ event: STORE_EVENTS.STORE_UPDATE, data: payload });
      }

      try {
        globalThis.__GLOBAL_STORE__?.on(STORE_EVENTS.SNAPSHOT, onSnapshot);
        globalThis.__GLOBAL_STORE__?.on(STORE_EVENTS.STORE_UPDATE, onStateUpdate);
      } catch { }
    },
    cancel() {
      closed = true;
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
      try {
        if (onSnapshot) globalThis.__GLOBAL_STORE__?.off(STORE_EVENTS.SNAPSHOT, onSnapshot);
        if (onStateUpdate) globalThis.__GLOBAL_STORE__?.off(STORE_EVENTS.STORE_UPDATE, onStateUpdate);
      } catch { }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Allow browser to keep connection open in modern proxies/CDNs
      'X-Accel-Buffering': 'no',
    },
  });
}
