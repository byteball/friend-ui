import { Info } from "lucide-react";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getExplorerUrl } from "@/lib/getExplorerUrl";
import { truncateAddress } from "../../domain/transform-value";

interface GovernanceDepositAssetItemHeaderProps {
  symbol?: string;
  loading?: boolean;
  currentValue?: string;
}

export const GovernanceDepositAssetItemHeader = ({ symbol, currentValue, loading }: GovernanceDepositAssetItemHeaderProps) => (
  <CardHeader className="text-lg">
    <CardTitle className="flex flex-col items-center justify-between md:flex-row">
      {loading
        ?
        <Skeleton className="w-[350px] h-[1.1em]" />
        : <div className="flex gap-x-2 shrink-0">
          Deposit asset {symbol} price AA
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Address of the Oswap AA used to determine the price of {symbol} relative to GBYTE for calculation of rewards
              </p>
            </TooltipContent>
          </Tooltip>
        </div>}

      {currentValue ? <div className="max-w-xs grow-0">
        Current value: {currentValue === "no" ? <span>against this asset
        </span> : <a target="_blank" href={getExplorerUrl(currentValue, "address")}>{truncateAddress(currentValue)}</a>}
      </div> : null}
    </CardTitle>
  </CardHeader>)