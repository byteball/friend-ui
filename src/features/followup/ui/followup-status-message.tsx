import { FC, ReactNode } from "react";

import { FOLLOWUP_REWARD_DAYS, type FollowupRewardStatus } from "../domain/utils";

interface FollowupStatusMessageProps {
  status: FollowupRewardStatus;
  rewardNumber: number | null;
  daysRemaining: number | null;
  currentMilestone: number | null;
  daysSinceFriendship: number;
  unlockWarnings?: string[] | null;
  children?: ReactNode;
}

export const FollowupStatusMessage: FC<FollowupStatusMessageProps> = ({
  status,
  rewardNumber,
  daysRemaining,
  currentMilestone,
  daysSinceFriendship,
  unlockWarnings,
  children,
}) => {
  if (status === "ACTIVE") {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-primary font-medium">
            Follow-up reward #{rewardNumber} is available!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left to claim. Both friends must claim within 10 minutes of each other.
          </p>
          {unlockWarnings && unlockWarnings.map((warning, i) => (
            <p key={i} className="text-sm text-yellow-400 mt-1 first-letter:uppercase">
              {warning}
            </p>
          ))}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    );
  }

  if (status === "NOT_STARTED") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-primary/80 font-medium">
          Next follow-up reward #{rewardNumber} in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Friends for {daysSinceFriendship} day{daysSinceFriendship !== 1 ? "s" : ""}. The next milestone is at {currentMilestone} days.
        </p>
      </div>
    );
  }

  if (status === "GOT" || status === "GOT_ALL") {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
        <p className="text-primary font-medium">
          All available follow-up rewards have been claimed
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Friends for {daysSinceFriendship} days. The follow-up program includes {FOLLOWUP_REWARD_DAYS.length} rewards.
        </p>
      </div>
    );
  }

  if (status === "EXPIRED") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-muted-foreground font-medium">
          The claim window has expired
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          The 10-day window to claim this reward has passed. Missing a follow-up reward doesn&apos;t forfeit subsequent ones.
        </p>
      </div>
    );
  }

  return null;
};
