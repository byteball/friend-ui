import { subDays } from "date-fns";

export const getCurrentStreak = (userData: IUserData | undefined) => {
  if (!userData || !userData.last_date || !userData.current_streak) return 0;

  const today = new Date().setUTCHours(0, 0, 0, 0);
  const lastDate = new Date(`${userData.last_date}T00:00:00Z`).getTime();
  const yesterday = subDays(today, 1).getTime();

  if (lastDate === yesterday || lastDate === today) {
    return userData.current_streak;
  }

  return 0;
};