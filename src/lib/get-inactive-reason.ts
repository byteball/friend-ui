import { appConfig } from "@/app-config";
import { addDays, isAfter, isSameDay, isValid, parseISO } from "date-fns";

export type InactiveReason = "no_locked_balance" | "term_too_short";

/**
 * Explains why a user is not "active" (i.e. can't be added as a friend), or returns null when active.
 * - "no_locked_balance": the user has no locked balance at all
 * - "term_too_short": the user has a locked balance, but its term is shorter than the minimum (1 year)
 */
export const getInactiveReason = (userData?: IUserData | undefined): InactiveReason | null => {
  if (!userData?.unlock_date) return "no_locked_balance";

  const unlockDate = parseISO(userData.unlock_date);
  if (!isValid(unlockDate)) return "no_locked_balance";

  const minLockedDate = addDays(new Date(), appConfig.MIN_LOCKED_TERM_DAYS);
  const isLongEnough = isAfter(unlockDate, minLockedDate) || isSameDay(unlockDate, minLockedDate);

  return isLongEnough ? null : "term_too_short";
};
