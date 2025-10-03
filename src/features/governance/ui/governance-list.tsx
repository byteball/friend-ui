import { FC } from "react";

import { GovernanceItem } from "./governance-item";

import { appConfig } from "@/appConfig";

export const GovernanceList: FC = () => (<div className="grid gap-8">
  {Object.keys(appConfig.initialParamsVariables).map((key) => (
    <GovernanceItem
      key={key}
      name={key as keyof AgentParams}
    />
  ))}
</div>)
