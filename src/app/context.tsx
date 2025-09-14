"use client";
import "client-only";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { STORE_EVENTS } from "@/constants";

const DataContext = createContext<IClientSnapshot | null>(null);

export function useData() {
  return useContext(DataContext);
}

type DataProviderProps = { children: React.ReactNode, value: IClientSnapshot | null };

export function DataProvider({ children, value }: DataProviderProps) {
  const [data, setData] = useState<IClientSnapshot>(value || { state: {}, tokens: {} });
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    const es = new EventSource("/api/data/stream");
    sseRef.current = es;

    console.log('log(context): SSE connecting...');

    es.onmessage = (ev) => {
      console.log('log(context): SSE message received', ev);

      try {
        console.log('cancelled', cancelled)
        if (cancelled) return;

        const incoming = JSON.parse(ev.data);
        console.log('log(context): msg status', incoming.event);

        if (incoming.event === STORE_EVENTS.SNAPSHOT) {
          console.log('log(context): msg value', incoming.data);
          setData(incoming.data as IClientSnapshot); // inital full snapshot
        } else if (incoming.event === STORE_EVENTS.STORE_UPDATE) {
          console.log('log(context): msg value', incoming.data);
          setData((prev) => ({
            state: { ...(prev?.state ?? {}), ...(incoming.data as IAaStore) },
            tokens: prev?.tokens ?? {},
          }));
        }
      } catch (err) {
        console.log("error(context): failed to parse incoming SSE message", err);
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // if in case of error the browser will try to reconnect automatically
      console.warn("log(context): SSE connection error, retrying automatically...");
    };

    return () => {
      cancelled = true;
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, []);

  const ctx = useMemo(() => data, [data]);

  return <DataContext.Provider value={ctx || null}>{children}</DataContext.Provider>;
}
