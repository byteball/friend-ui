"use client";

import Link from "next/link";
import { FC, useMemo } from "react";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";
import { Button } from "@/components/ui/button";

import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { getVPByBalance } from "@/lib/get-vp-by-balance";
import { toLocalString } from "@/lib/to-local-string";

interface GovernanceProfileProps {
  walletAddress?: string;
}

export const GovernanceProfile: FC<GovernanceProfileProps> = ({ walletAddress }) => {
  const data = useData();
  const { getFrdToken } = data;

  const frdToken = getFrdToken();

  const ceilingPrice = useMemo(() => getCeilingPrice(data.state.constants), [data.state.constants]);
  const userBalance = useMemo(() => data.state[`user_${walletAddress}`]?.balances ?? {}, [data.state, walletAddress]);
  const votingPower = useMemo(() => getVPByBalance(userBalance, ceilingPrice, frdToken.decimals), [userBalance, ceilingPrice, frdToken.decimals]);

  if (!walletAddress) {
    return <div className="font-medium">
      Please{" "}
      <AddWalletModal>
        <Button variant="link" className="p-0 m-0 text-md link-style">add your wallet address</Button>
      </AddWalletModal>
      {" "}to see your voting balance
    </div>
  }

  return <div>
    Your wallet address: <span><Link href={`/${walletAddress}`}>
      {String(walletAddress).slice(0, 5)}...{String(walletAddress).slice(-5, String(walletAddress).length)}
    </Link>
    </span>

    <div>
      Your voting power: <span suppressHydrationWarning>{toLocalString(votingPower)}</span> (square root of your locked balance, <Link href="/faq#how-governance-works" className="underline"> see FAQ</Link>)
    </div>
  </div>;
}