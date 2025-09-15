import { VerifiedIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const DepositedLabel = ({ deposited }: { deposited: boolean }) => {
  if (!deposited) return null;

  return <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <VerifiedIcon className="w-10 h-10 text-blue-500" />
      </TooltipTrigger>
      <TooltipContent >
        This user already has a locked deposit, and you can become their friend.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
}