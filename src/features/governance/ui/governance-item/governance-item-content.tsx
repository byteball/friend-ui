"use client";

import "client-only";
import { FC } from "react";
import Countdown from 'react-countdown';

import { CardContent } from "@/components/ui/card";
import { GovernanceItemSupportsTable } from "./governance-item-supports-table";

import { generateLink } from "@/lib/generate-link";

import { useData } from "@/app/context";
import { appConfig } from "@/appConfig";
import { challengingCountdownRenderer } from "../../domain/countdown-renderer";
import { transformValue } from "../../domain/transform-value";

export type GovernanceItemContentProps<K extends keyof AgentParams = keyof AgentParams> = {
  name: K;
  leaderValue?: AgentParams[K];
  currentValue: AgentParams[K];
  supportsValues?: Record<string, number>;
  challengingPeriodStartTs?: number;
  choices: Record<string, AgentParams[K]>;
};

export const GovernanceItemContent: FC<GovernanceItemContentProps> = ({ name, leaderValue, supportsValues, currentValue, choices, challengingPeriodStartTs = 0 }) => {
  const { getFrdToken, getGovernanceAA } = useData();

  const frdToken = getFrdToken();
  const governanceAa = getGovernanceAA();

  const timeEndChallengingPeriod = challengingPeriodStartTs + appConfig.CHALLENGING_PERIOD;

  const commitUrl = generateLink({
    aa: governanceAa,
    amount: 10000,
    data: {
      commit: 1,
      name
    }
  });

  return <CardContent>
    {leaderValue ? <div suppressHydrationWarning className="flex items-center justify-between">
      <div>Leader: {transformValue(name, leaderValue, frdToken)}</div>
      {timeEndChallengingPeriod && currentValue !== leaderValue
        ? <Countdown
          date={timeEndChallengingPeriod * 1000}
          renderer={(props) => challengingCountdownRenderer(props, commitUrl)}
        /> : null}
    </div> : null}

    {supportsValues && Object.keys(supportsValues).length > 0 && <div className="mt-4">
      <GovernanceItemSupportsTable
        supportsValues={supportsValues}
        name={name}
        choices={choices}
        frdToken={frdToken}
      />
    </div>}
  </CardContent>
}