import useSWR from "swr";

import { useData } from "@/app/context";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { executeGetter } from "@/lib/http-client";

import { appConfig } from "@/app-config";

const REQUEST_CONFIG = {
  refreshInterval: 30_000, // refresh every 30 seconds
  dedupingInterval: 15_000,
};

type ExchangeRateKey = ["exchange-rate", string, string, boolean];

export const useExchangeRate = (inputAsset: string | null, outputAsset: string | null, isRawValue: boolean = false) => {
  const aaData = useData();
  const frdToken = aaData.getFrdToken();
  const tokens = aaData.tokens;

  const swrKey: ExchangeRateKey | null = inputAsset && outputAsset ? [
    "exchange-rate",
    inputAsset,
    outputAsset,
    isRawValue
  ] : null;

  const fetchExchangeRate = async ([, from, to]: ExchangeRateKey): Promise<number> => {
    if (!from || !to) return 0;
    if (from === to) return 1;

    const inputToken = tokens[from];
    const outputToken = tokens[to];

    if (!inputToken || !outputToken) {
      throw new Error("Unknown asset provided to exchange rate fetcher");
    }

    const ceilingPrice = getCeilingPrice(aaData.state.constants);

    if (from !== "base" && to !== "base") {
      // both are deposit tokens
      const asset = from === frdToken.asset ? to : from;

      const { max } = await executeGetter(
        appConfig.AA_ADDRESS,
        "get_deposit_asset_exchange_rates",
        [asset],
      ) as { min: number; max: number };

      const decimals = 10 ** (inputToken.decimals - outputToken.decimals);

      const depositAssetRate = isRawValue ? max / 1.1 : max;

      if (from === frdToken.asset) {
        // FRD to other asset (not GBYTE)
        return (ceilingPrice / depositAssetRate) * decimals;
      }

      if (to === frdToken.asset) {
        // other asset (not GBYTE) to FRD
        return (depositAssetRate / ceilingPrice) * decimals;
      }

      throw new Error("Invalid asset combination");
    }

    if (
      (from === "base" || to === "base")
      && (from === frdToken.asset || to === frdToken.asset)
    ) {
      if (from === frdToken.asset) {
        // FRD to GBYTE
        return ceilingPrice;
      }

      if (to === frdToken.asset) {
        // GBYTE to FRD
        return 1 / ceilingPrice;
      }

      throw new Error("Invalid asset combination");
    }

    throw new Error("Invalid asset combination");
  };

  const { data, isLoading, error, isValidating } = useSWR<number>(
    swrKey,
    fetchExchangeRate,
    REQUEST_CONFIG,
  );

  return {
    data,
    isValidating,
    isLoading,
    error,
  };
};

