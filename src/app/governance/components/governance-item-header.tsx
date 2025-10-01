import { Info } from "lucide-react";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { descriptions } from "../descriptions";

import { useData } from "@/app/context";
import { getNameByKey } from "../utils/get-name-by-key";
import { transformValue } from "../utils/transform-value";


export type GovernanceItemHeaderProps<K extends keyof AgentParams = keyof AgentParams> = {
  name: K;
  currentValue: AgentParams[K];
};

interface GovernableItemHeaderProps<K extends keyof AgentParams> {
  name: K;
  currentValue: AgentParams[K];
}

export const GovernableItemHeader = <K extends keyof AgentParams>({ name, currentValue }: GovernableItemHeaderProps<K>) => {
  const { getFrdToken } = useData();
  const frdToken = getFrdToken();

  return (
    <CardHeader className="text-lg">
      <CardTitle className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex gap-x-2 shrink-0">{getNameByKey(name)}
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{descriptions[name] ?? ""}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grow-0 max-w-xs">
          Current value: <span>{transformValue(name, currentValue, frdToken)}</span>
        </div>
      </CardTitle>
    </CardHeader>)
};
