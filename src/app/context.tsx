"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const DataContext = createContext<IClientData | null>(null);

export function useData() {
  return useContext(DataContext);
}

type DataProviderProps = { value: IClientData; children: React.ReactNode };

export function DataProvider({ value, children }: DataProviderProps) {
  const [data, setData] = useState<IClientData>(value);
  const sseRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setData(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;

    const apply = (incoming: IClientData) =>
      setData((prev) => ({
        state: { ...prev.state, ...incoming.state },
        symbols: { ...prev.symbols, ...incoming.symbols },
      }));

    const es = new EventSource("/api/data/stream");
    sseRef.current = es;

    es.onmessage = (ev) => {
      try {
        const incoming = JSON.parse(ev.data) as IClientData;
        if (!cancelled) apply(incoming);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // if in case of error the browser will try to reconnect automatically
      console.warn("SSE connection error, retrying automatically...");
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

  return <DataContext.Provider value={ctx}>{children}</DataContext.Provider>;
}
