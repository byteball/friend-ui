"use client";
"use no memo"

import { appConfig } from "@/app-config";
import { STORE_EVENTS } from "@/constants";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import "client-only";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSSE } from "use-next-sse";

/**
 * Types you already have in your codebase; keep these placeholders if needed.
 */
type IAaState = Record<string, any>;
type IClientSnapshot = { state: IAaState; tokens: Record<string, any>; governanceState: Record<string, any>; params: AgentParams; gbytePriceUSD: number; };

type StoreEventEnvelope =
  | { event: typeof STORE_EVENTS.SNAPSHOT; data: Partial<IClientSnapshot> }
  | { event: typeof STORE_EVENTS.STATE_UPDATE; data: IAaState & { variables?: AgentParams } }
  | { event: typeof STORE_EVENTS.GOVERNANCE_STATE_UPDATE; data: Record<string, any> }
  | { event?: string; data?: unknown };

const STREAM_URL = "/api/data/stream";
const RECONNECT_INTERVAL_MS = 2_000;
const SSE_RECONNECT = {
  interval: RECONNECT_INTERVAL_MS,
  maxAttempts: Number.MAX_SAFE_INTEGER,
} as const;
const DEFAULT_SNAPSHOT: IClientSnapshot = {
  state: {},
  governanceState: {},
  tokens: {},
  params: appConfig.initialParamsVariables,
  gbytePriceUSD: 0,
};
const IS_PRODUCTION = true //process.env.NODE_ENV === "production";

const logWarn = (...args: unknown[]) => {
  if (!IS_PRODUCTION) console.warn("[SSE]", ...args);
};

const DataContext = createContext<IClientSnapshot | null>(null);

export function useData() {
  const data = useContext(DataContext);
  if (!data) throw new Error("useData must be used within a DataProvider");

  const getFrdToken = useCallback((): TokenMeta => {
    const asset = data.state?.constants?.asset;
    return data.tokens?.[asset] ?? {};
  }, [data]);

  const getGovernanceAA = useCallback((): string => {
    return data.state?.constants?.governance_aa;
  }, [data]);

  const getUserData = useCallback((address: string): IUserData | null => {
    return (data.state?.[`user_${address}`] || null) as IUserData | null;
  }, [data]);

  const getFrdPrice = useCallback((): number => {
    const constants = data.state?.constants as IConstants | undefined;
    if (!constants) return 0;

    const frdToken = data.tokens?.[constants.asset];
    if (!frdToken) return 0;

    const ceilPrice = getCeilingPrice(constants);

    return ceilPrice * data.gbytePriceUSD;
  }, [data]);

  return useMemo(() => ({
    ...data,
    getFrdToken,
    getGovernanceAA,
    getUserData,
    getFrdPrice
  }), [data, getFrdToken, getGovernanceAA, getUserData]);
}

type DataProviderProps = {
  children: React.ReactNode;
  value: IClientSnapshot | null; // initial (SSR) snapshot
  streamUrl?: string; // override if needed
  fetchSnapshot?: () => Promise<IClientSnapshot | null>; // optional hard resync
};

export function DataProvider({
  children,
  value = DEFAULT_SNAPSHOT,
  streamUrl = STREAM_URL,
  fetchSnapshot,
}: DataProviderProps) {

  const resolvedInitialValue = useMemo(() => value ?? DEFAULT_SNAPSHOT, [value]);
  const [data, setData] = useState<IClientSnapshot>(resolvedInitialValue);
  const lastEventRef = useRef<string | number>(null);

  useEffect(() => {
    console.log("%cDataProvider mounted", "color: green");

    return () => {
      console.log("%cDataProvider unmounted", "color: red");
    };
  }, []);

  useEffect(() => {
    setData(resolvedInitialValue);
  }, [resolvedInitialValue]);

  const fetchSnapshotRef = useRef(fetchSnapshot);
  useEffect(() => {
    fetchSnapshotRef.current = fetchSnapshot;
  }, [fetchSnapshot]);

  const applyIncoming = useCallback((incoming: StoreEventEnvelope) => {
    try {
      if (!incoming?.event) return;

      if (incoming.event === STORE_EVENTS.SNAPSHOT) {
        const snapshot = (incoming.data ?? {}) as Partial<IClientSnapshot>;
        setData({
          state: snapshot.state ?? {},
          governanceState: snapshot.governanceState ?? {},
          tokens: snapshot.tokens ?? {},
          gbytePriceUSD: snapshot.gbytePriceUSD ?? 0,
          params: snapshot.params ?? snapshot.state?.variables ?? appConfig.initialParamsVariables,
        });
        return;
      }

      if (incoming.event === STORE_EVENTS.STATE_UPDATE) {
        const update = (incoming.data ?? {}) as IAaState & { variables?: AgentParams };
        setData((prev) => ({
          state: { ...(prev?.state ?? {}), ...update },
          governanceState: prev?.governanceState ?? {},
          tokens: prev?.tokens ?? {},
          gbytePriceUSD: prev?.gbytePriceUSD ?? 0,
          params: update.variables ?? prev?.params ?? appConfig.initialParamsVariables,
        }));
        return;
      }

      if (incoming.event === STORE_EVENTS.GOVERNANCE_STATE_UPDATE) {
        const governanceUpdate = (incoming.data ?? {}) as Record<string, any>;
        setData((prev) => ({
          ...prev,
          governanceState: { ...(prev?.governanceState ?? {}), ...governanceUpdate },
        }));
      }
    } catch (err) {
      logWarn("applyIncoming error", err);
    }
  }, [setData]);

  const { data: incomingMessage, error, connectionState } = useSSE<StoreEventEnvelope>({
    url: streamUrl,
    reconnect: SSE_RECONNECT,
  });

  useEffect(() => {
    if (!incomingMessage) return;

    if (incomingMessage.event === "HEARTBEAT") {
      return; // ignore heartbeats
    }


    const hash = JSON.stringify(incomingMessage.data);
    if (hash === lastEventRef.current) return;

    lastEventRef.current = hash;

    applyIncoming(incomingMessage);
  }, [incomingMessage, applyIncoming]);

  const triggerSnapshotSync = useCallback(async () => {
    if (!fetchSnapshotRef.current) return;
    try {
      const snapshot = await fetchSnapshotRef.current();
      if (snapshot) setData(snapshot);
    } catch (err) {
      logWarn("snapshot refresh failed", err);
    }
  }, [setData]);

  const lastConnectionState = useRef(connectionState);

  useEffect(() => {
    if (connectionState === "open" && lastConnectionState.current !== "open") {
      triggerSnapshotSync();
    }
    lastConnectionState.current = connectionState;
  }, [connectionState, triggerSnapshotSync]);

  useEffect(() => {
    if (error) {
      logWarn("SSE connection error", error);

      const t = setTimeout(() => {
        triggerSnapshotSync();
      }, 500);

      return () => clearTimeout(t);
    }
  }, [error, triggerSnapshotSync]);

  return (
    <DataContext.Provider value={data || null}>
      {children}
    </DataContext.Provider>
  );
}