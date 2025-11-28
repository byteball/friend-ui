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

  const balanceHistory = parsedData.success
    ? parsedData.data.filter((item) => Number.isFinite(item?.total_balance_sans_reducers))
    : [];

  return {
    data: balanceHistory,
    isLoading,
    isError: Boolean(error || !parsedData.success),
  };
}