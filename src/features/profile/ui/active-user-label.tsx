import { VerifiedIcon } from "lucide-react";
import { FC } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActiveUserLabelProps {
  isActive: boolean;
}

export const ActiveUserLabel: FC<ActiveUserLabelProps> = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  return <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <VerifiedIcon className="w-10 h-10 text-blue-500" />
      </TooltipTrigger>
      <TooltipContent>
        This user already has a locked deposit, and you can become their friend.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
}