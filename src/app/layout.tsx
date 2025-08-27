import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Navbar from "@/components/layouts/main-navbar";

import "./globals.css";

const InterFont = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friend",
  description: "Become friends with someone and get rewards, or claim follow-up rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InterFont.className} antialiased`}
      >
        <Navbar />

        <div className="container mx-auto p-5">{children}</div>
      </body>
    </html>
  );
}
