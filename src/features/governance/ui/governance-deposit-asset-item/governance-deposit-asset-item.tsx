"use client";

import { FC } from "react";

import { DepositAssetVote } from "../../domain/get-deposit-assets-data";
import { GovernanceDepositAssetItemContent } from "./governance-deposit-asset-item-content";
import { GovernanceDepositAssetItemFooter } from "./governance-deposit-asset-item-footer";
import { GovernanceDepositAssetItemHeader } from "./governance-deposit-asset-item-header";
import { GovernanceDepositAssetItemWrapper } from "./governance-deposit-asset-item-wrapper";

import { useToken } from "@/hooks/use-token";

import { useData } from "@/app/context";

export type GovernanceItemProps = {
  leaderValue?: string;
  asset: string;
  challengingPeriodStartTs?: number;
  votes?: DepositAssetVote[];
  supportedValues?: Record<string, number>; // pool address -> total support amount
};

export const GovernanceDepositAssetItem: FC<GovernanceItemProps> = ({
  leaderValue,
  challengingPeriodStartTs,
  votes,
  asset,
  supportedValues
}) => {
  const { state, getGovernanceAA } = useData();
  const { symbol, loading } = useToken({ asset });

  const governanceAa = getGovernanceAA();

  return (
    <GovernanceDepositAssetItemWrapper>
      <GovernanceDepositAssetItemHeader
        symbol={symbol!}
        loading={loading}
        currentValue={state[`deposit_asset_${asset}`]}
      />

      <GovernanceDepositAssetItemContent
        leaderValue={leaderValue}
        currentValue={state[`deposit_asset_${asset}`]}
        votes={votes}
        asset={asset}
        supportedValues={supportedValues}
        challengingPeriodStartTs={challengingPeriodStartTs}
      />

      <GovernanceDepositAssetItemFooter
        governanceAa={governanceAa}
        depositAsset={asset}
        depositAssetSymbol={symbol!}
        alreadyAdded={`deposit_asset_${asset}` in state}
      />

    </GovernanceDepositAssetItemWrapper>
  );
}