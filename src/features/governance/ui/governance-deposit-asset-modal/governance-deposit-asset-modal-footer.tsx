import { FC } from "react";

import { DialogClose, DialogFooter } from "@/components/ui/dialog";

interface GovernanceDepositAssetModalFooterProps {
  children: React.ReactNode;
}

export const GovernanceDepositAssetModalFooter: FC<GovernanceDepositAssetModalFooterProps> = ({ children }) => {
  return <DialogFooter>
    <DialogClose asChild>
      {children}
    </DialogClose>
  </DialogFooter>
}
