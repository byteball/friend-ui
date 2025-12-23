import { FC } from "react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";

import { generateLink } from "@/lib/generate-link";

import { GovernanceDepositAssetModal } from "../governance-deposit-asset-modal";

interface GovernanceItemFooterProps {
  depositAsset: string;
  depositAssetSymbol: string;
  governanceAa: string;
  alreadyAdded: boolean;
}

export const GovernanceDepositAssetItemFooter: FC<GovernanceItemFooterProps> = ({
  depositAsset,
  governanceAa,
  depositAssetSymbol,
  alreadyAdded
}) => (<CardFooter className="flex gap-x-4">
  <GovernanceDepositAssetModal
    depositAssetSymbol={depositAssetSymbol}
    depositAsset={depositAsset}
    defaultValue={undefined}
  >
    <Button variant="link" className="p-0 m-0">suggest another price AA</Button>
  </GovernanceDepositAssetModal>

  <QRButton
    href={generateLink({
      aa: governanceAa,
      amount: 10000,
      data: {
        name: "deposit_asset",
        value: "no",
        deposit_asset: depositAsset
      }
    })}
    disabled={alreadyAdded}
    variant="link"
    className="p-0 m-0"
  >
    vote against this asset
  </QRButton>
</CardFooter>)