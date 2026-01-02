import { getCookie } from "cookies-next";
import { Metadata } from "next";
import { cookies } from "next/headers";

import { WALLET_COOKIE_NAME } from "@/constants";

import { env } from "@/env";
import { GovernanceProfile, GovernanceTabs } from "@/features/governance";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Obyte Friends — Governance",
  description: "Community governance of Obyte Friends: change the rules for rewards and other parameters",
  openGraph: {
    images: [
      `/api/og/common/governance`,
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ObyteOrg',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
}

export default async function GovernancePage() {
  const walletAddress = await getCookie(WALLET_COOKIE_NAME, { cookies })

  return <div className="w-full max-w-full">
    <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Governance</h1>

    <div className="mt-5">
      <GovernanceProfile walletAddress={walletAddress} />
    </div>

    <GovernanceTabs />
  </div>
}
