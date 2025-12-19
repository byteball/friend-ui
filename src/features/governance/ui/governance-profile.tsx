"use client";

import Link from "next/link";
import { FC } from "react";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";
import { Button } from "@/components/ui/button";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { toLocalString } from "@/lib/to-local-string";

interface GovernanceProfileProps {
  walletAddress?: string;
}

export const GovernanceProfile: FC<GovernanceProfileProps> = ({ walletAddress }) => {
  const data = useData();
  const frdToken = data.getFrdToken();
  const ceilingBalance = getCeilingPrice(data.state.constants);

  const userBaseBalance = data.state[`user_${walletAddress}`]?.balances;
  const votingPower = Math.sqrt((userBaseBalance?.frd ?? 0) + ((userBaseBalance?.base ?? 0) / ceilingBalance));

  if (!walletAddress) {
    return <div className="font-medium">
      Please{" "}
      <AddWalletModal>
        <Button variant="link" className="p-0 m-0 text-white underline underline-offset-3 text-md">add your wallet address</Button>
      </AddWalletModal>
      {" "}to see voting balance
    </div>
  }

  return <div>
    Your wallet address: <span><Link href={`/${walletAddress}`} className="text-white underline underline-offset-3">
      {String(walletAddress).slice(0, 5)}...{String(walletAddress).slice(-5, String(walletAddress).length)}
    </Link>
    </span>

    <div>
      Your voting power: <span suppressHydrationWarning>{toLocalString(votingPower / 10 ** frdToken.decimals)}</span>
    </div>
  </div>;
}