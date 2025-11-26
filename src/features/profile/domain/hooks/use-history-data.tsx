import { appConfig } from "@/app-config";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
interface IHistoryItem {
  address: string;
  trigger_unit: string;
  event: 'rewards' | "deposit";

  total_balance_with_reducers: number;
  total_balance_sans_reducers: number;

  locked_reward: number;

  liquid_reward: number;
  new_user_reward: number;
  referral_reward: number;
  is_stable: number;
  trigger_date: string;
  creation_date: string;
  total_locked_rewards: number;
  total_liquid_rewards: number;
}

export function useHistoryData(address: string) {
  const shouldFetch = Boolean(address);

  const { data, error, isLoading } = useSWR<IHistoryItem[]>(
    shouldFetch ? `${appConfig.NOTIFY_URL}/history/${address}` : null,
    fetcher<IHistoryItem>
  );

  const balanceHistory = Array.isArray(data)
    ? data.filter((item) => Number.isFinite(item?.total_balance_sans_reducers))
    : [];

  return {
    data: balanceHistory,
    isLoading,
    isError: Boolean(error),
  };
}