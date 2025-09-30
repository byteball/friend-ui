"use client";
import { appConfig } from "@/appConfig";
import { STORE_EVENTS } from "@/constants";
import "client-only";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Types you already have in your codebase; keep these placeholders if needed.
 */
type IAaState = Record<string, any>;
type IClientSnapshot = { state: IAaState; tokens: Record<string, any>, governanceState: Record<string, any>, params: AgentParams };

const STREAM_URL = "/api/data/stream";
const HEARTBEAT_MS = 30_000;   // reconnect if no messages within this window
const BACKOFF_BASE_MS = 1_000; // initial backoff
const BACKOFF_MAX_MS = 30_000; // max backoff
const BACKOFF_FACTOR = 2;      // exponential factor
const JITTER_PCT = 0.2;    // ±20% jitter

const DataContext = createContext<IClientSnapshot | null>(null);

export function useData() {
  const data = useContext(DataContext);
  if (!data) throw new Error("useData must be used within a DataProvider");

  return data;
}

type DataProviderProps = {
  children: React.ReactNode;
  value: IClientSnapshot | null;  // initial (SSR) snapshot
  streamUrl?: string; // override if needed
  fetchSnapshot?: () => Promise<IClientSnapshot | null>; // optional hard resync
};

export function DataProvider({
  children,
  value = { state: {}, governanceState: {}, tokens: {}, params: appConfig.initialParamsVariables },
  streamUrl = STREAM_URL,
  fetchSnapshot
}: DataProviderProps) {
  const [data, setData] = useState<IClientSnapshot>(value || { state: {}, tokens: {}, governanceState: {}, params: appConfig.initialParamsVariables });

  // ---- Stable refs
  const esRef = useRef<EventSource | null>(null);
  const closedByUsRef = useRef(false);
  const cancelledRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const backoffRef = useRef(BACKOFF_BASE_MS);
  const lastMsgAtRef = useRef<number>(Date.now());
  const lastEventIdRef = useRef<string | null>(null); // for resume if server supports it

  // ---- Small helpers
  const isVisible = () => document.visibilityState === "visible";
  const isOnline = () => navigator.onLine;

  const clearTimer = (r: React.MutableRefObject<number | null>) => {
    if (r.current != null) {
      clearTimeout(r.current);
      r.current = null;
    }
  };

  const log = (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") console.log("[SSE]", ...args);
  };
  const warn = (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") console.warn("[SSE]", ...args);
  };

  const safeClose = (reason?: string) => {
    if (esRef.current) {
      try { esRef.current.close(); } catch { }
      esRef.current = null;
    }
    clearTimer(heartbeatTimerRef);
    clearTimer(reconnectTimerRef);
    warn("closed:", reason, "| online=", isOnline(), "visible=", isVisible());
  };

  const resetBackoff = () => (backoffRef.current = BACKOFF_BASE_MS);

  const waitForOnlineAndVisible = () => {
    // Gentle polling that waits for both conditions before attempting reconnect/open
    clearTimer(reconnectTimerRef);
    reconnectTimerRef.current = window.setTimeout(() => {
      if (cancelledRef.current || closedByUsRef.current) return;
      if (isOnline() && isVisible()) {
        resetBackoff();
        open();
      } else {
        warn("waiter: online=", isOnline(), "visible=", isVisible());
        waitForOnlineAndVisible();
      }
    }, 1200);
  };

  const scheduleReconnect = () => {
    const base = backoffRef.current;
    const jitterRange = base * JITTER_PCT;
    const jitter = (Math.random() * 2 - 1) * jitterRange;
    const delay = Math.min(BACKOFF_MAX_MS, Math.max(300, base + jitter));

    backoffRef.current = Math.min(BACKOFF_MAX_MS, Math.round(base * BACKOFF_FACTOR));

    clearTimer(reconnectTimerRef);
    reconnectTimerRef.current = window.setTimeout(() => {
      if (cancelledRef.current || closedByUsRef.current) return;
      if (isOnline() && isVisible()) {
        warn("reconnect now (delay≈", Math.round(delay), "ms)");
        open();
      } else {
        warn("postpone reconnect: online=", isOnline(), "visible=", isVisible());
        waitForOnlineAndVisible();
      }
    }, delay);

    warn("scheduled reconnect in ~", Math.round(delay), "ms");
  };

  const startHeartbeat = () => {
    clearTimer(heartbeatTimerRef);
    heartbeatTimerRef.current = window.setTimeout(() => {
      const idleFor = Date.now() - lastMsgAtRef.current;
      const rs = esRef.current?.readyState; // 0=CONNECTING,1=OPEN,2=CLOSED
      if (!cancelledRef.current && !closedByUsRef.current && idleFor >= HEARTBEAT_MS) {
        warn("heartbeat timeout; readyState=", rs);
        safeClose("heartbeat-timeout");
        scheduleReconnect();
      } else {
        startHeartbeat();
      }
    }, HEARTBEAT_MS);
  };

  const applyIncoming = (incoming: any) => {
    lastMsgAtRef.current = Date.now();

    if (incoming?.id && typeof incoming.id === "string") {
      lastEventIdRef.current = incoming.id;
    }

    const ev = incoming?.event;
    if (!ev) return;

    if (ev === STORE_EVENTS.SNAPSHOT) {
      setData({
        ...incoming.data,
        params: incoming.state?.variables ?? appConfig.initialParamsVariables
      } as IClientSnapshot);
    } else if (ev === STORE_EVENTS.STATE_UPDATE) {
      setData((prev) => ({
        state: { ...(prev?.state ?? {}), ...(incoming.data as IAaState) },
        governanceState: prev?.governanceState ?? {},
        tokens: prev?.tokens ?? {},
        params: incoming.data?.variables ?? prev?.params ?? appConfig.initialParamsVariables
      }));
    } else if (ev === STORE_EVENTS.GOVERNANCE_STATE_UPDATE) {
      setData((prev) => ({
        ...prev,
        governanceState: { ...(prev?.governanceState ?? {}), ...(incoming.data) },
      }));
    }
  };

  const open = () => {
    // Don't start if offline or hidden; rely on waiter
    if (!isOnline() || !isVisible()) {
      warn("open deferred: online=", isOnline(), "visible=", isVisible());
      closedByUsRef.current = false;
      waitForOnlineAndVisible();
      return;
    }

    safeClose("reopen");

    const url = new URL(streamUrl, window.location.origin);
    // Optional: resume from lastEventId via query if your server expects it
    if (lastEventIdRef.current) url.searchParams.set("lastEventId", lastEventIdRef.current);

    const es = new EventSource(url.toString());
    esRef.current = es;
    closedByUsRef.current = false;

    startHeartbeat();

    es.onopen = () => {
      resetBackoff();
      lastMsgAtRef.current = Date.now();
      log("onopen (readyState=", es.readyState, ")");
      // Optional hard resync after reconnect when server doesn't support Last-Event-ID
      if (fetchSnapshot) {
        fetchSnapshot().then((snap) => {
          if (snap && !cancelledRef.current) setData(snap);
        }).catch(() => { });
      }
    };

    es.onmessage = (ev) => {
      try {
        const incoming = JSON.parse(ev.data);
        applyIncoming(incoming);
      } catch (err) {
        warn("parse error:", err);
      }
    };

    es.onerror = () => {
      warn("onerror (readyState=", es.readyState, ")");
      // If CLOSED — recreate with our policy
      if (es.readyState === EventSource.CLOSED) {
        safeClose("readyState=CLOSED");
        scheduleReconnect();
      }
      // If CONNECTING and stuck, heartbeat will break and reconnect.
    };
  };

  // ---- Lifecycle
  useEffect(() => {
    cancelledRef.current = false;
    open();

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        closedByUsRef.current = true;
        safeClose("tab-hidden");
        // Do not schedule reconnect now; waiter will re-open on visible+online
      } else {
        closedByUsRef.current = false;
        resetBackoff();
        if (isOnline()) open(); else waitForOnlineAndVisible();
      }
    };

    const onOnline = () => {
      log("window online");
      closedByUsRef.current = false;
      resetBackoff();
      open(); // reconnect immediately when network returns
    };

    const onOffline = () => {
      log("window offline");
      closedByUsRef.current = true;
      safeClose("offline");
      waitForOnlineAndVisible(); // in case 'online' event isn't fired or missed
    };

    // document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      cancelledRef.current = true;
      closedByUsRef.current = true;
      safeClose("unmount");
      // document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  return (
    <DataContext.Provider value={data || null}>
      {children}
    </DataContext.Provider>
  );
}