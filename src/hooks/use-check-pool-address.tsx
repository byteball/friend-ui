"use client";

import { useCallback, useEffect, useState } from "react";

import httpClient from "@/lib/httpClient";
import { isValidAddress } from "@/lib/isValidAddress";

export const useCheckPoolAddress = (address: string, asset: string | null) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);

  const checkPool = useCallback(async (address: string, asset: string): Promise<boolean> => {
    const data = await httpClient.getDefinition(address);
    if (!data) return false;

    const params = data[1]?.params;
    if (!params) return false;

    const bX = params.y_asset == 'base' && params.x_asset == asset;
    const bY = params.x_asset == 'base' && params.y_asset == asset;

    return bX || bY;
  }, []);

  useEffect(() => {
    if (isValidAddress(address)) {

      if (!asset) {
        setIsValid(false);
        setLoading(false);
        setError("Asset is required to check the pool");
        return;
      }

      checkPool(address, asset).then(valid => {
        setIsValid(valid);
        setError(valid ? null : "This address is not a valid Oswap AA");
      }).catch(err => {
        setIsValid(false);
        setError(err.message || "Error checking Oswap AA");
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setIsValid(false);
      setLoading(false);
      setError("Invalid address");
    }

  }, [address, asset, checkPool]);

  return { isValid, loading, error };
}
