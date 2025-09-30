"use client";

import { getGovernanceDataByKey } from "../utils/get-governance-data-by-key.server";
import { GovernanceItemContent } from "./governance-item-content";
import { GovernableItemHeader } from "./governance-item-header";
import { GovernanceItemWrapper } from "./governance-item-wrapper";

import { useData } from "@/app/context";

export type GovernanceItemProps<K extends keyof AgentParams = keyof AgentParams> = {
  name: K;
};

export function GovernanceItem<K extends keyof AgentParams>({ name }: GovernanceItemProps<K>) {
  const data = useData();

  const { asset, governance_aa } = data.state.constants;
  const frdToken = data.tokens?.[asset];
  const currentValue = data.params?.[name];

  const governanceStateData = getGovernanceDataByKey<K>(name, data.governanceState);

  return (
    <GovernanceItemWrapper>

      <GovernableItemHeader
        name={name}
        currentValue={currentValue}
        frdToken={frdToken}
      />

      <GovernanceItemContent
        name={name}
        leaderValue={governanceStateData.leader}
        supportsValues={governanceStateData.supports}
        challengingPeriodStartTs={governanceStateData.challenging_period_start_ts}
        frdToken={frdToken}
        currentValue={currentValue}
        governanceAa={governance_aa}
      />

      {/* <GovernanceItemFooter /> */}
    </GovernanceItemWrapper>
  );
}