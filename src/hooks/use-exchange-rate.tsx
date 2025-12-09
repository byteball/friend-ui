import useSWR from "swr";

import { useData } from "@/app/context";
import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { executeGetter } from "@/lib/http-client";

import { appConfig } from "@/app-config";

const REQUEST_CONFIG = {
  refreshInterval: 30_000, // refresh every 30 seconds
  dedupingInterval: 15_000,
}

export const useExchangeRate = (inputAsset: string, outputAsset: string | null) => {
  const aaData = useData();
  const frdToken = aaData.getFrdToken();

  const { data, isLoading, error, isValidating, } = useSWR([inputAsset, outputAsset], async ([inputAsset, outputAsset]: [string, string, string]) => {

    if (!inputAsset || !outputAsset) return 0;
    if (inputAsset === outputAsset) return 1;

    if (inputAsset !== "base" && outputAsset !== "base") {
      // both are deposit tokens

      const asset = inputAsset === frdToken.asset ? outputAsset : inputAsset;
      const ceilingPrice = getCeilingPrice(aaData.state.constants);

      const d1 = await executeGetter(appConfig.AA_ADDRESS, 'get_deposit_asset_exchange_rates', [asset]) as { min: number; max: number };

      if (inputAsset === frdToken.asset) { // FRD to other asset (not GBYTE)
        return ceilingPrice / d1.max;
      } else if (outputAsset === frdToken.asset) { // other asset (not GBYTE) to FRD
        return d1.min / ceilingPrice;
      } else {
        throw new Error('Invalid asset combination');
      }

    } else if (
      (inputAsset === "base" || outputAsset === "base")
      && (inputAsset === frdToken.asset || outputAsset === frdToken.asset)
    ) {

      const ceilingPrice = getCeilingPrice(aaData.state.constants);

      if (inputAsset === frdToken.asset) { // FRD to GBYTE 
        return ceilingPrice;
      } else if (outputAsset === frdToken.asset) { // GBYTE to FRD
        return 1 / ceilingPrice;
      } else {
        throw new Error('Invalid asset combination');
      }

    } else {
      throw new Error('Invalid asset combination');
    }
  },
    REQUEST_CONFIG
  );

  return {
    data,
    isValidating,
    isLoading,
    error
  }
};

