"use client";

import Link from "next/link";
import { FC } from "react";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";
import { Button } from "@/components/ui/button";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { getVPByBalance } from "@/lib/calculations/get-vp-by-balance";
import { toLocalString } from "@/lib/to-local-string";

interface GovernanceProfileProps {
  walletAddress?: string;
}

export const GovernanceProfile: FC<GovernanceProfileProps> = ({ walletAddress }) => {
  const data = useData();
  const frdToken = data.getFrdToken();
  const ceilingPrice = getCeilingPrice(data.state.constants);

  const userBaseBalance = data.state[`user_${walletAddress}`]?.balances;
  const votingPower = getVPByBalance(userBaseBalance, ceilingPrice, frdToken.decimals);

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