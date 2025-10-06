"use client";

import { FC } from "react";

import { getDepositAssetsData } from "../domain/get-deposit-assets-data";
import { GovernanceDepositAssetItem } from "./governance-deposit-asset-item/governance-deposit-asset-item";

import { useData } from "@/app/context";

export const GovernanceDepositAssetList: FC = () => {
  const data = useData();
  const depositAssetsData = getDepositAssetsData(data.governanceState || {});

  return <div className="grid gap-8">
    {Object.entries(depositAssetsData).map(([asset, value]) => (
      <GovernanceDepositAssetItem
        key={asset}
        asset={asset}
        leaderValue={value.leader}
        challengingPeriodStartTs={value.challengingPeriodStartTs}
        votes={value.votes}
      />
    ))}
  </div>
}
