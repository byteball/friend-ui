"use client";

import { ProgressProvider } from '@bprogress/next/app';
import { CookiesNextProvider } from "cookies-next";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ProvidersProps) {
  return <ProgressProvider
    height="4px"
    color="#1447e6"
    options={{ showSpinner: false }}
    shallowRouting
  >
    <CookiesNextProvider pollingOptions={{ enabled: true, intervalMs: 1000 }}>
      {children}
    </CookiesNextProvider>
  </ProgressProvider>;
}