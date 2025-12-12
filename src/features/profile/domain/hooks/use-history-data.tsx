import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { historySchema } from "@/lib/schemas";

import { appConfig } from "@/app-config";

export function useHistoryData(address: string) {
  const shouldFetch = Boolean(address);

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `${appConfig.NOTIFY_URL}/history/${address}` : null,
    fetcher
  );

  const parsedData = historySchema.safeParse(data ?? []);

  if (!parsedData.success) {
    console.error("Failed to parse reward history", parsedData.error.issues);
  }

  let balanceHistory = parsedData.success
    ? parsedData.data.filter((item) => Number.isFinite(item?.total_balance_sans_reducers))
    : [];

  // Sort by trigger_date from old to new
  balanceHistory = balanceHistory.sort((a, b) => {
    const dateA = new Date(a.trigger_date).getTime();
    const dateB = new Date(b.trigger_date).getTime();
    return dateA - dateB;
  });

  // Add initial entry with 0 balances one day before the first event
  if (balanceHistory.length > 0) {
    const firstEvent = balanceHistory[0];
    const firstDate = new Date(firstEvent.trigger_date);
    const oneDayBefore = new Date(firstDate.getTime() - 24 * 60 * 60 * 1000);
    const oneDayBeforeStr = oneDayBefore.toISOString().slice(0, 19).replace('T', ' ');

    const initialEntry = {
      address: firstEvent.address,
      trigger_unit: 'no',
      event: 'rewards' as const,
      total_balance_with_reducers: 0,
      total_balance_sans_reducers: 0,
      locked_reward: 0,
      liquid_reward: 0,
      new_user_reward: 0,
      referral_reward: 0,
      is_stable: true,
      trigger_date: oneDayBeforeStr,
      creation_date: oneDayBeforeStr,
      total_locked_rewards: 0,
      total_liquid_rewards: 0,
    };

    balanceHistory = [initialEntry, ...balanceHistory];
  }

  return {
    data: balanceHistory,
    isLoading,
    isError: Boolean(error || !parsedData.success),
  };
}