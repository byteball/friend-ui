import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { FC } from "react";

interface GovernanceModalFooterProps {
  children: React.ReactNode;
}

export const GovernanceModalFooter: FC<GovernanceModalFooterProps> = ({ children }) => {
  return <DialogFooter>
    <DialogClose asChild>
      {children}
    </DialogClose>
  </DialogFooter>
}
