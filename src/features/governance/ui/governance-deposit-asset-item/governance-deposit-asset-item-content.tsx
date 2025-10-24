"use client";

import "client-only";
import { FC } from "react";
import Countdown from "react-countdown";

import { challengingCountdownRenderer } from "../../domain/countdown-renderer";
import { DepositAssetVote } from "../../domain/get-deposit-assets-data";
import { truncateAddress } from "../../domain/transform-value";

import { CardContent } from "@/components/ui/card";
import { GovernanceDepositAssetItemSupportsTable } from "./governance-deposit-asset-item-supports-table";

import { useData } from "@/app/context";

import { generateLink } from "@/lib/generate-link";
import { getExplorerUrl } from "@/lib/get-explorer-url";

import { appConfig } from "@/app-config";

export interface GovernanceDepositAssetItemContent {
  leaderValue?: string;
  asset: string;
  challengingPeriodStartTs?: number;
  votes: DepositAssetVote[] | undefined;
};

export const GovernanceDepositAssetItemContent: FC<GovernanceDepositAssetItemContent> = ({
  leaderValue,
  challengingPeriodStartTs = 0,
  votes = [],
  asset
}) => {
  const { getFrdToken, getGovernanceAA } = useData();
  const frdToken = getFrdToken();
  const governanceAa = getGovernanceAA();

  const timeEndChallengingPeriod = challengingPeriodStartTs + appConfig.CHALLENGING_PERIOD;

  const commitUrl = generateLink({
    aa: governanceAa,
    amount: 10000,
    data: {
      commit: 1,
      name: 'deposit_asset',
      deposit_asset: asset
    }
  });

  return <CardContent>
    {leaderValue ? <div suppressHydrationWarning className="flex items-center justify-between">
      <div>Leader: {leaderValue === "no" ? <span>against this asset</span> : <a className="text-blue-700" target="_blank" href={getExplorerUrl(leaderValue, "address")}>{truncateAddress(leaderValue)}</a>}
      </div>

      {timeEndChallengingPeriod
        ? <Countdown
          date={timeEndChallengingPeriod * 1000}
          renderer={(props) => challengingCountdownRenderer(props, asset !== 'no' ? commitUrl : undefined)}
        /> : null}
    </div> : null}

    {votes.length > 0 ? <div className="mt-4">
      <GovernanceDepositAssetItemSupportsTable
        asset={asset}
        votes={votes}
        frdToken={frdToken}
        governanceAa={governanceAa}
      />
    </div> : null}
  </CardContent>
}