"use client";

import { ProgressProvider } from '@bprogress/next/app';
import { CookiesNextProvider } from "cookies-next";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode, useCallback } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const IGNORED_PROTOCOLS = new Set(["obyte:", "obyte-tn:"]);

export function ClientProviders({ children }: ProvidersProps) {
  const normalizeProgressTarget = useCallback((url: URL) => {
    if (IGNORED_PROTOCOLS.has(url.protocol) && typeof window !== "undefined") {
      return new URL(window.location.href);
    }

    return url;
  }, []);

  return <ProgressProvider
    height="4px"
    color="#1447e6"
    options={{ showSpinner: false }}
    shallowRouting
    targetPreprocessor={normalizeProgressTarget}
  >
    <CookiesNextProvider pollingOptions={{ enabled: true, intervalMs: 1000 }}>
      <NuqsAdapter>
        {children}
      </NuqsAdapter>
    </CookiesNextProvider>
  </ProgressProvider>;
}