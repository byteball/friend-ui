import { appConfig } from '@/app-config';
import useSWR from 'swr';



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
  const { data, error, isLoading } = useSWR<IHistoryItem[]>(`${appConfig.NOTIFY_URL}/history/${address}`);

  return {
    data: data?.filter(item => item.event === 'rewards') || [],
    isLoading,
    isError: error
  }
}