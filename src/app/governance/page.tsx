import { getCookie } from "cookies-next";
import { cookies } from "next/headers";

import { WALLET_COOKIE_NAME } from "@/constants";

import { GovernanceProfile, GovernanceTabs } from "@/features/governance";

export const dynamic = 'force-dynamic';

export default async function GovernancePage() {
  const walletAddress = await getCookie(WALLET_COOKIE_NAME, { cookies })

  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Governance</h1>

    <div className="mt-5">
      <GovernanceProfile walletAddress={walletAddress} />
    </div>

    <GovernanceTabs />
  </div>
}
