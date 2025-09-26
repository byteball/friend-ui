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

            <div className="container mx-auto p-5">{children}</div>
          </ClientProviders>
        </DataProvider> : <NoDefineAsset />}
      </body>
    </html>
  );
}
