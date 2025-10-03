import { FC } from "react";

import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { descriptions } from "../../domain/descriptions";
import { getNameByKey } from "../../domain/get-name-by-key";

interface GovernanceModalHeaderProps {
  name: keyof AgentParams;
}

export const GovernanceModalHeader: FC<GovernanceModalHeaderProps> = ({ name }) => (<DialogHeader>
  <DialogTitle>Change {getNameByKey(name).toLowerCase()}</DialogTitle>

  {name in descriptions ? <DialogDescription>
    {descriptions[name]}
  </DialogDescription> : null}
</DialogHeader>)