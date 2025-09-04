"use client";

import { CookiesNextProvider } from "cookies-next";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ProvidersProps) {
  return <CookiesNextProvider pollingOptions={{ enabled: true, intervalMs: 1000 }}>{children}</CookiesNextProvider>;
}