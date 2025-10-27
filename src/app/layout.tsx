import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "@/components/layouts/main-navbar";
import { NoDefineAsset } from "@/components/layouts/no-define-asset";

import { ClientProviders } from "./client-providers";
import { DataProvider } from "./context";

import "./globals.css";

const InterFont = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friend",
  description: "Become friends with someone and get rewards, or claim follow-up rewards",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = globalThis.__GLOBAL_STORE__?.getSnapshot();

  return (
    <html lang="en">
      <body
        className={`${InterFont.className} antialiased`}
      >
        {snapshot?.state?.constants ? <DataProvider value={snapshot ?? null}>
          <ClientProviders>
            <Navbar />

            <div className="container p-5 mx-auto min-h-[calc(100vh-12rem)]">{children}</div>
          </ClientProviders>
        </DataProvider> : <NoDefineAsset />}

        <footer className="p-4 pb-1 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">
            All dates are in your local timezone UTC unless indicated otherwise
          </div>
          <a href="https://obyte.org" target="_blank" rel="noopener noreferrer">Built on Obyte</a>
        </footer>

      </body>
    </html>
  );
}
