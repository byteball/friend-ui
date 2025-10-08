"use client";

import { getGovernanceDataByKey } from "../../domain/get-governance-data-by-key";
import { GovernanceItemContent } from "./governance-item-content";
import { GovernanceItemFooter } from "./governance-item-footer";
import { GovernableItemHeader } from "./governance-item-header";
import { GovernanceItemWrapper } from "./governance-item-wrapper";

import { useData } from "@/app/context";

import { appConfig } from "@/appConfig";

export type GovernanceItemProps<K extends keyof AgentParams = keyof AgentParams> = {
  name: K;
};

export function GovernanceItem<K extends keyof AgentParams>({ name }: GovernanceItemProps<K>) {
  const { governanceState, params } = useData();
  const governanceStateData = getGovernanceDataByKey<K>(name, governanceState);

  const currentValue = params[name] ?? appConfig.initialParamsVariables[name];

  return (
    <GovernanceItemWrapper>
      <GovernableItemHeader
        name={name}
        currentValue={currentValue}
      />

      <GovernanceItemContent
        name={name}
        leaderValue={governanceStateData.leader}
        supportsValues={governanceStateData.supports}
        challengingPeriodStartTs={governanceStateData.challenging_period_start_ts}
        currentValue={currentValue}
        choices={governanceStateData.choices}
      />

      <GovernanceItemFooter
        name={name}
      />
    </GovernanceItemWrapper>
  );
}