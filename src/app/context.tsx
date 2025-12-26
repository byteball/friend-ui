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

// Socket.IO server runs on separate port (3001) in same process
// In production, use env var to configure the URL
const SOCKET_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
  : '';
const SOCKET_PATH = '/socket.io'; // Default Socket.IO path
const RECONNECT_DELAY_MS = 2_000;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('%c[Socket.IO] Configuration:', 'color: cyan; font-weight: bold');
  console.log('  URL:', SOCKET_URL);
  console.log('  Path:', SOCKET_PATH);
  console.log('  Full connection:', `${SOCKET_URL}${SOCKET_PATH}`);
  console.log('  Env var:', process.env.NEXT_PUBLIC_SOCKET_URL);
}

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
  const isMountedRef = useRef(true);
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  // Selective router refresh for Server Components
  // Client Components update automatically via React Context
  // Server Components need occasional refresh for fresh data
  const throttledRefresh = useMemo(
    () =>
      throttle(
        () => {
          // Only refresh if component is still mounted
          if (!isMountedRef.current) {
            console.log('%c[Socket.IO] Skipping refresh - unmounted', 'color: orange');
            return;
          }

          // Gentle refresh every 30 seconds for Server Components
          console.log('%c[Socket.IO] Refreshing Server Components', 'color: cyan');
          router.refresh();
        },
        30000, // 30 seconds instead of 3 - much less aggressive
        { leading: false, trailing: true }
      ),
    [router]
  );

  useEffect(() => {
    console.log("%cDataProvider mounted", "color: green");
    isMountedRef.current = true;

    return () => {
      console.log("%cDataProvider unmounted", "color: red");
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setData(resolvedInitialValue);
  }, [resolvedInitialValue]);

  const fetchSnapshotRef = useRef(fetchSnapshot);
  useEffect(() => {
    fetchSnapshotRef.current = fetchSnapshot;
  }, [fetchSnapshot]);

  // Stable references for Socket.IO callbacks to avoid reconnections
  const applyIncomingRef = useRef<((eventType: string, eventData: any) => void) | null>(null);
  const triggerSnapshotSyncRef = useRef<(() => Promise<void>) | null>(null);

  const applyIncoming = useCallback((eventType: string, eventData: any) => {
    console.log('%c[Client] applyIncoming called', 'color: cyan', eventType);

    try {
      // Ignore updates if component is unmounted
      if (!isMountedRef.current) {
        console.log('%c[Client] Ignoring update - component unmounted', 'color: orange');
        return;
      }

      if (!eventType) return;

      if (eventType === STORE_EVENTS.SNAPSHOT) {
        console.log('%c[Client] Processing SNAPSHOT', 'color: cyan', {
          stateKeys: Object.keys(eventData?.state || {}).length,
          tokensCount: Object.keys(eventData?.tokens || {}).length,
        });
        const snapshot = (eventData ?? {}) as Partial<IClientSnapshot>;
        setData({
          state: snapshot.state ?? {},
          governanceState: snapshot.governanceState ?? {},
          tokens: snapshot.tokens ?? {},
          gbytePriceUSD: snapshot.gbytePriceUSD ?? 0,
          params: snapshot.params ?? snapshot.state?.variables ?? appConfig.initialParamsVariables,
        });
        console.log('%c[Client] SNAPSHOT applied', 'color: green');
        return;
      }

      if (eventType === STORE_EVENTS.STATE_UPDATE) {
        const update = (eventData ?? {}) as IAaState & { variables?: AgentParams };

        // Deduplication check
        const hash = JSON.stringify(update);
        if (hash === lastEventRef.current) {
          console.log('%c[Client] STATE_UPDATE deduplicated', 'color: yellow');
          return;
        }
        lastEventRef.current = hash;

        console.log('%c[Client] Processing STATE_UPDATE', 'color: cyan', Object.keys(update).length, 'keys');
        setData((prev) => ({
          state: { ...(prev?.state ?? {}), ...update },
          governanceState: prev?.governanceState ?? {},
          tokens: prev?.tokens ?? {},
          gbytePriceUSD: prev?.gbytePriceUSD ?? 0,
          params: update.variables ?? prev?.params ?? appConfig.initialParamsVariables,
        }));
        console.log('%c[Client] STATE_UPDATE applied', 'color: green');
        return;
      }

      if (eventType === STORE_EVENTS.GOVERNANCE_STATE_UPDATE) {
        const governanceUpdate = (eventData ?? {}) as Record<string, any>;

        // Deduplication check
        const hash = JSON.stringify(governanceUpdate);
        if (hash === lastEventRef.current) {
          console.log('%c[Client] GOVERNANCE_STATE_UPDATE deduplicated', 'color: yellow');
          return;
        }
        lastEventRef.current = hash;

        console.log('%c[Client] Processing GOVERNANCE_STATE_UPDATE', 'color: cyan');
        setData((prev) => ({
          ...prev,
          governanceState: { ...(prev?.governanceState ?? {}), ...governanceUpdate },
        }));
        console.log('%c[Client] GOVERNANCE_STATE_UPDATE applied', 'color: green');
      }
    } catch (err) {
      console.error('%c[Client] applyIncoming error', 'color: red', err);
      logWarn("applyIncoming error", err);
    }
  }, []);

  const triggerSnapshotSync = useCallback(async () => {
    if (!fetchSnapshotRef.current) return;
    try {
      const snapshot = await fetchSnapshotRef.current();
      if (snapshot) setData(snapshot);
    } catch (err) {
      logWarn("snapshot refresh failed", err);
    }
  }, [setData]);

  // Update stable references
  useEffect(() => {
    applyIncomingRef.current = applyIncoming;
    triggerSnapshotSyncRef.current = triggerSnapshotSync;
  }, [applyIncoming, triggerSnapshotSync]);

  // Socket.IO connection management
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY_MS,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20, // Limit to 20 attempts instead of Infinity
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('%c[Socket.IO] Connected', 'color: green', socket.id);
      setIsConnected(true);
      triggerSnapshotSyncRef.current?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('%c[Socket.IO] Disconnected', 'color: orange', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      logWarn('Connection error:', error);
    });

    // Event listeners - use stable references
    socket.on(STORE_EVENTS.SNAPSHOT, (payload) => {
      applyIncomingRef.current?.(STORE_EVENTS.SNAPSHOT, payload);
      // No refresh needed - snapshot is full state replacement
    });

    socket.on(STORE_EVENTS.STATE_UPDATE, (payload) => {
      applyIncomingRef.current?.(STORE_EVENTS.STATE_UPDATE, payload);
      throttledRefresh();
    });

    socket.on(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, (payload) => {
      applyIncomingRef.current?.(STORE_EVENTS.GOVERNANCE_STATE_UPDATE, payload);
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
  }, [throttledRefresh]);

  return (
    <DataContext.Provider value={data || null}>
      {children}
    </DataContext.Provider>
  );
}