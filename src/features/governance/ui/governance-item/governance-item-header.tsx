import { Info } from "lucide-react";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useData } from "@/app/context";

import { descriptions } from "../../domain/descriptions";
import { getNameByKey } from "../../domain/get-name-by-key";
import { transformValue } from "../../domain/transform-value";

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
      <CardTitle className="flex flex-col md:items-center md:justify-between md:flex-row">
        <div className="flex gap-x-2 shrink-0">{getNameByKey(name)}
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              <p>{descriptions[name] ?? ""}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="max-w-xs grow-0">
          Current value: <span>{transformValue(name, currentValue, frdToken)}</span>
        </div>
      </CardTitle>
    </CardHeader>)
};
