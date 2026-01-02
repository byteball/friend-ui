import { appConfig } from "@/app-config";
import { addDays, isAfter, isSameDay, parseISO } from "date-fns";

export const isActiveUser = (userData?: IUserData | undefined): boolean => {
  if (!userData) return false;

  const unlockDate = parseISO(userData.unlock_date);

  const minLockedDate = unlockDate ? addDays(new Date(), appConfig.MIN_LOCKED_TERM_DAYS) : null;
  return minLockedDate && unlockDate ? isAfter(unlockDate, minLockedDate) || isSameDay(unlockDate, minLockedDate) : false;
}