import { appConfig } from "@/app-config";
import useSWR from "swr";

const historyFetcher = async (url: string): Promise<IHistoryItem[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch reward history: ${response.status}`);
  }

  const payload = await response.json().catch(() => null);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload;
};

interface IHistoryItem {
  address: string;
  trigger_unit: string;
  event: 'rewards' | "deposit";
  total_balance: number;
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

export function useRewardChartData(address: string) {
  const shouldFetch = Boolean(address);

  const { data, error, isLoading } = useSWR<IHistoryItem[]>(
    shouldFetch ? `${appConfig.NOTIFY_URL}/history/${address}` : null,
    historyFetcher
  );

  const rewardsOnly = Array.isArray(data)
    ? data.filter((item) => item?.event === "rewards")
    : [];

  return {
    data: rewardsOnly,
    isLoading,
    isError: error,
  };
}