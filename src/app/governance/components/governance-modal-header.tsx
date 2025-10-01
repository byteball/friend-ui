import { FC } from "react";

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { descriptions } from "../descriptions";
import { getNameByKey } from "../utils/get-name-by-key";

interface GovernanceModalHeaderProps {
  name: keyof AgentParams;
}

export const GovernanceModalHeader: FC<GovernanceModalHeaderProps> = ({ name }) => {
  return <DialogHeader>
    <DialogTitle>Change {getNameByKey(name)}</DialogTitle>

    {name in descriptions ? <DialogDescription>
      {descriptions[name]}
    </DialogDescription> : null}
  </DialogHeader>
}
