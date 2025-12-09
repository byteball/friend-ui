"use client";

import { ProgressProvider } from '@bprogress/next/app';
import { CookiesNextProvider } from "cookies-next";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode, useCallback } from "react";
import { SWRConfig } from 'swr';
import { DataProvider } from './context';

interface ProvidersProps {
  children: ReactNode;
  initialSnapshot: IClientSnapshot | null;
}


const IGNORED_PROTOCOLS = new Set(["obyte:", "obyte-tn:"]);

export function ClientProviders({ children, initialSnapshot }: ProvidersProps) {
  const normalizeProgressTarget = useCallback((url: URL) => {
    if (IGNORED_PROTOCOLS.has(url.protocol) && typeof window !== "undefined") {
      return new URL(window.location.href);
    }

    return url;
  }, []);

  return <DataProvider value={initialSnapshot}>
    <ProgressProvider
      height="4px"
      color="#1447e6"
      options={{ showSpinner: false }}
      shallowRouting
      targetPreprocessor={normalizeProgressTarget}
    >
      <CookiesNextProvider pollingOptions={{ enabled: true, intervalMs: 1000 }}>
        <NuqsAdapter>
          <SWRConfig
            value={{
              refreshInterval: 60000,
              fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
            }}
          >
            {children}
          </SWRConfig>
        </NuqsAdapter>
      </CookiesNextProvider>
    </ProgressProvider>
  </DataProvider>;
}