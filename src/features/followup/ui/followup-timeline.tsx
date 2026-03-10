import { FC } from "react";
import cn from "classnames";

import { FOLLOWUP_REWARD_DAYS, FOLLOWUP_CLAIM_TERM } from "../domain/utils";

interface FollowupTimelineProps {
  daysSinceFriendship: number;
  friendship: Record<string, any> | null;
}

export const FollowupTimeline: FC<FollowupTimelineProps> = ({
  daysSinceFriendship,
  friendship,
}) => {
  return (
    <div className="grid gap-2">
      <h3 className="text-lg font-semibold">Follow-up reward schedule</h3>
      <div className="grid gap-1">
        {FOLLOWUP_REWARD_DAYS.map((days, index) => {
          const followupData = friendship?.[`followup_${days}`];
          const isClaimed = !!followupData?.accept_ts;
          const isActive = daysSinceFriendship >= days && daysSinceFriendship <= days + FOLLOWUP_CLAIM_TERM && !isClaimed;
          const isExpired = daysSinceFriendship > days + FOLLOWUP_CLAIM_TERM && !isClaimed;
          const isFuture = daysSinceFriendship < days;

          return (
            <div
              key={days}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                {
                  "bg-primary/10 text-primary": isActive,
                  "bg-primary/5 text-primary/80": isClaimed,
                  "text-muted-foreground/50": isExpired,
                  "text-muted-foreground": isFuture,
                }
              )}
            >
              <div className={cn(
                "size-2 rounded-full shrink-0",
                {
                  "bg-primary": isActive,
                  "bg-primary/60": isClaimed,
                  "bg-muted-foreground/30": isExpired,
                  "bg-muted-foreground/50": isFuture,
                }
              )} />
              <span>#{index + 1} &mdash; {days} days</span>
              {isClaimed && <span className="ml-auto text-xs">Claimed</span>}
              {isActive && <span className="ml-auto text-xs font-medium">Active now</span>}
              {isExpired && <span className="ml-auto text-xs line-through">Expired</span>}
              {isFuture && <span className="ml-auto text-xs">{days - daysSinceFriendship} days left</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
