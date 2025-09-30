import { FC } from "react";
import Countdown from 'react-countdown';

import { CardContent } from "@/components/ui/card";
import { GovernanceItemSupportsTable } from "./governance-item-supports-table";

import { generateLink } from "@/lib/generateLink";

import { challengingCountdownRenderer } from "../utils/countdown-renderer";
import { transformValue } from "../utils/transform-value";

import { appConfig } from "@/appConfig";

export type GovernanceItemContentProps<K extends keyof AgentParams = keyof AgentParams> = {
  name: K;
  leaderValue?: AgentParams[K];
  currentValue: AgentParams[K];
  supportsValues?: Record<string, number>;
  challengingPeriodStartTs?: number;
  frdToken: TokenMeta;
  governanceAa: string;
};

export const GovernanceItemContent: FC<GovernanceItemContentProps> = ({ name, leaderValue, frdToken, supportsValues, governanceAa, currentValue, challengingPeriodStartTs = 0 }) => {

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
    {leaderValue ? <div className="flex justify-between items-center">
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
        frdToken={frdToken}
      />
    </div>}
  </CardContent>
}