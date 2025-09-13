import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatSse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;
  let onSnapshot: ((payload: IClientData) => void) | null = null;

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

      const send = (data: unknown) => safeEnqueue(formatSse(data));

      heartbeat = setInterval(() => safeEnqueue(': keepalive\n\n'), 15000);

      const initial = {
        state: globalThis.__STATE_VARS_STORAGE__
          ? Object.fromEntries(globalThis.__STATE_VARS_STORAGE__.entries())
          : {},
        symbols: globalThis.__SYMBOL_STORAGE__
          ? Object.fromEntries(globalThis.__SYMBOL_STORAGE__.entries())
          : {},
      } satisfies IClientData;

      send(initial);

      onSnapshot = (payload: IClientData) => send(payload);
      try {
        globalThis.__DATA_EVENT_EMITTER__?.on('snapshot', onSnapshot);
      } catch { }
    },
    cancel() {
      closed = true;
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
      try {
        if (onSnapshot) globalThis.__DATA_EVENT_EMITTER__?.off('snapshot', onSnapshot);
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
