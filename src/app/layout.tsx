import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "@/components/layouts/main-navbar";

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
  const data: IClientData = {
    state: globalThis.__STATE_VARS_STORAGE__ ? Object.fromEntries(globalThis.__STATE_VARS_STORAGE__.entries()) : {},
    symbols: globalThis.__SYMBOL_STORAGE__ ? Object.fromEntries(globalThis.__SYMBOL_STORAGE__.entries()) : {}
  }

  return (
    <html lang="en">
      <body
        className={`${InterFont.className} antialiased`}
      >
        <DataProvider value={data}>
          <ClientProviders>
            <Navbar />

            <div className="container mx-auto p-5">{children}</div>
          </ClientProviders>
        </DataProvider>
      </body>
    </html>
  );
}
