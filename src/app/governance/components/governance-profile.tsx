"use client";

import Link from "next/link";
import { FC } from "react";

import { useData } from "@/app/context";
import { AddWalletModal } from "@/components/modals/add-wallet";
import { getCeilingPrice } from "@/lib/calculations/getRewards";
import { toLocalString } from "@/lib/toLocalString";

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
      {/* <AddWalletModal */}
      <AddWalletModal>
        <button className="underline">add your wallet address</button>
      </AddWalletModal>
      {" "}to see voting balance
    </div>
  }

  return <div>
    Your wallet address: <span><Link href={`/user/${walletAddress}`} className="text-blue-700">
      {String(walletAddress).slice(0, 5)}...{String(walletAddress).slice(-5, String(walletAddress).length)}
    </Link>
    </span>

    <div>
      Your voting power: <span suppressHydrationWarning>{toLocalString(votingPower)}</span> <small>{frdToken.symbol}</small>
    </div>
  </div>;
}