"use client";
"use no memo"

import { appConfig } from "@/app-config";
import { STORE_EVENTS } from "@/constants";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import "client-only";
import { throttle } from "lodash";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

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

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';
const SOCKET_PATH = '/api/socket';
const RECONNECT_DELAY_MS = 2_000;

const DEFAULT_SNAPSHOT: IClientSnapshot = {
  state: {},
  governanceState: {},
  tokens: {},
  params: appConfig.initialParamsVariables,
  gbytePriceUSD: 0,
};

const IS_PRODUCTION = true; // process.env.NODE_ENV === "production";

const logWarn = (...args: unknown[]) => {
  if (!IS_PRODUCTION) console.warn("[Socket.IO]", ...args);
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
  value: IClientSnapshot | null;
  fetchSnapshot?: () => Promise<IClientSnapshot | null>;
};

export function DataProvider({
  children,
  value = DEFAULT_SNAPSHOT,
  fetchSnapshot,
}: DataProviderProps) {

  const resolvedInitialValue = useMemo(() => value ?? DEFAULT_SNAPSHOT, [value]);
  const [data, setData] = useState<IClientSnapshot>(resolvedInitialValue);
  const lastEventRef = useRef<string | number>(null);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  // Throttled router.refresh to update server components without blocking UI
  // Max once every 3 seconds, no matter how many state updates occur
  const throttledRefresh = useMemo(
    () =>
      throttle(
        () => {
          console.log('%c[Socket.IO] Refreshing server components (throttled)', 'color: purple');
          router.refresh();
        },
        3000, // 3 seconds
        { leading: false, trailing: true }
      ),
    [router]
  );

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

  const applyIncoming = useCallback((eventType: string, eventData: any) => {
    try {
      if (!eventType) return;

      if (eventType === STORE_EVENTS.SNAPSHOT) {
        const snapshot = (eventData ?? {}) as Partial<IClientSnapshot>;
        setData({
          state: snapshot.state ?? {},
          governanceState: snapshot.governanceState ?? {},
          tokens: snapshot.tokens ?? {},
          gbytePriceUSD: snapshot.gbytePriceUSD ?? 0,
          params: snapshot.params ?? snapshot.state?.variables ?? appConfig.initialParamsVariables,
        });
        return;
      }

      if (eventType === STORE_EVENTS.STATE_UPDATE) {
        const update = (eventData ?? {}) as IAaState & { variables?: AgentParams };

        // Deduplication check
        const hash = JSON.stringify(update);
        if (hash === lastEventRef.current) return;
        lastEventRef.current = hash;

        setData((prev) => ({
          state: { ...(prev?.state ?? {}), ...update },
          governanceState: prev?.governanceState ?? {},
          tokens: prev?.tokens ?? {},
          gbytePriceUSD: prev?.gbytePriceUSD ?? 0,
          params: update.variables ?? prev?.params ?? appConfig.initialParamsVariables,
        }));
        return;
      }

      if (eventType === STORE_EVENTS.GOVERNANCE_STATE_UPDATE) {
        const governanceUpdate = (eventData ?? {}) as Record<string, any>;

        // Deduplication check
        const hash = JSON.stringify(governanceUpdate);
        if (hash === lastEventRef.current) return;
        lastEventRef.current = hash;

        setData((prev) => ({
          ...prev,
          governanceState: { ...(prev?.governanceState ?? {}), ...governanceUpdate },
        }));
      }
    } catch (err) {
      logWarn("applyIncoming error", err);
    }
  }, [setData]);

  const triggerSnapshotSync = useCallback(async () => {
    if (!fetchSnapshotRef.current) return;
    try {
      const snapshot = await fetchSnapshotRef.current();
      if (snapshot) setData(snapshot);
    } catch (err) {
      logWarn("snapshot refresh failed", err);
    }
  }, [setData]);

  // Socket.IO connection management
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY_MS,
      reconnectionAttempts: Infinity,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('%c[Socket.IO] Connected', 'color: green', socket.id);
      setIsConnected(true);
      triggerSnapshotSync();
    });

    socket.on('disconnect', (reason) => {
      console.log('%c[Socket.IO] Disconnected', 'color: orange', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      logWarn('Connection error:', error);
    });

    // Event listeners
    socket.on(STORE_EVENTS.SNAPSHOT, (payload) => {
      applyIncoming(STORE_EVENTS.SNAPSHOT, payload);
      // No refresh needed - snapshot is full state replacement
    });

    socket.on(STORE_EVENTS.STATE_UPDATE, (payload) => {
      applyIncoming(STORE_EVENTS.STATE_UPDATE, payload);
      console.log('%c[Socket.IO] State updated, refreshing router', 'color: blue');
      throttledRefresh();
    });

    socket.on(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, (payload) => {
      applyIncoming(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload);
      console.log('%c[Socket.IO] Governance state updated, refreshing router', 'color: blue');
      throttledRefresh();
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');

      socket.off(STORE_EVENTS.SNAPSHOT);
      socket.off(STORE_EVENTS.STATE_UPDATE);
      socket.off(STORE_EVENTS.GOVERNANCE_STATE_UPDATE);

      socket.disconnect();
      socketRef.current = null;

      // Cancel any pending throttled refresh
      throttledRefresh.cancel();
    };
  }, [applyIncoming, triggerSnapshotSync, throttledRefresh]);

  return (
    <DataContext.Provider value={data || null}>
      {children}
    </DataContext.Provider>
  );
}