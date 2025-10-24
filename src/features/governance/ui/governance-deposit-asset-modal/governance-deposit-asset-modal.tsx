"use client";

import { FC, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QRButton } from "@/components/ui/qr-button";

import { GovernanceDepositAssetModalFooter } from "./governance-deposit-asset-modal-footer";

import { useData } from "@/app/context";

import { generateLink } from "@/lib/generate-link";
import { isValidAddress } from "@/lib/is-valid-address";
import { GovernanceDepositAssetModalContent } from "./governance-deposit-asset-modal-content";
import { GovernanceDepositAssetModalHeader } from "./governance-deposit-asset-modal-header";

interface GovernanceModalProps {
  children?: React.ReactNode;
  defaultValue?: string;
  depositAsset: string;
  depositAssetSymbol: string;
}

export const GovernanceDepositAssetModal: FC<GovernanceModalProps> = ({
  children,
  depositAsset,
  depositAssetSymbol,
  defaultValue
}) => {
  const [address, setAddress] = useState<string | null>();
  const { getGovernanceAA } = useData();
  const btnRef = useRef<HTMLButtonElement>(null);

  const voteUrl = address ? generateLink({
    amount: 10000,
    aa: getGovernanceAA(),
    data: {
      name: "deposit_asset",
      deposit_asset: depositAsset,
      value: address,
    }
  }) : "";

  const isValid = typeof address === 'string' ? isValidAddress(address) : false;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent>
        <GovernanceDepositAssetModalHeader
          symbol={depositAssetSymbol}
        />

        <GovernanceDepositAssetModalContent
          defaultValue={defaultValue ? String(defaultValue) : undefined}
          onChange={(value) => setAddress(value)}
          actionBtnRef={btnRef}
        />

        <GovernanceDepositAssetModalFooter>
          <QRButton ref={btnRef} disabled={!isValid || !voteUrl} href={voteUrl}>Change</QRButton>
        </GovernanceDepositAssetModalFooter>
      </DialogContent>
    </Dialog>
  );
};