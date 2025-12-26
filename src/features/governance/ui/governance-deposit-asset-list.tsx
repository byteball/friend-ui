"use client";

import { Plus } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import { getDepositAssetsData } from "../domain/get-deposit-assets-data";
import { AddNewDepositAssetModal } from "./add-new-deposit-asset-modal";
import { GovernanceDepositAssetItem } from "./governance-deposit-asset-item/governance-deposit-asset-item";

import { useData } from "@/app/context";

export const GovernanceDepositAssetList: FC = () => {
  const data = useData();
  const depositAssetsData = getDepositAssetsData(data.governanceState ?? {});

  return <div>
    <div className="flex mb-4 justify-end">
      <AddNewDepositAssetModal governanceAa={data.getGovernanceAA()}>
        <Button>
          <Plus /> Add new deposit asset
        </Button>
      </AddNewDepositAssetModal>
    </div>

    <div className="grid gap-y-8">
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
  </div>
}
