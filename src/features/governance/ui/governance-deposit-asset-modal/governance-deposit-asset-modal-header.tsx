import { FC } from "react";

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface GovernanceDepositAssetModalHeaderProps {
  symbol: string;
}

export const GovernanceDepositAssetModalHeader: FC<GovernanceDepositAssetModalHeaderProps> = ({ symbol }) => (<DialogHeader>
  <DialogTitle>Change price AA for {symbol}</DialogTitle>

  <DialogDescription>
    Address of the Oswap AA used to determine the price of {symbol} relative to GBYTE for calculation of rewards
  </DialogDescription>
</DialogHeader>)