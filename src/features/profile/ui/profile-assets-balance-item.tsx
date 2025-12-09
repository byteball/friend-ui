"use client"

import { FC, use } from "react";

import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { toLocalString } from "@/lib/to-local-string";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";

interface ProfileAssetBalanceItemProps {
  address: string;
  asset: string;
  balance: number;
  rateGetter: Promise<{ min: number; max: number }>;
}

export const ProfileAssetBalanceItem: FC<ProfileAssetBalanceItemProps> = ({
  asset,
  rateGetter,
  balance
}) => {
  const data = useData();
  const frdToken = data.getFrdToken();

  const rate = use(rateGetter);
  const ceilingPrice = getCeilingPrice(data.state.constants);

  const assetRate = (rate.min ?? 0) / 0.9; // use min rate for calculations
  const balanceInBytes = asset === "base" ? balance : asset === "frd" ? balance * ceilingPrice : balance * assetRate;

  const equivalentInFrd = balanceInBytes / ceilingPrice;

  let tokenMeta: TokenMeta | undefined = undefined;

  if (asset === "frd") {
    tokenMeta = { ...frdToken }
  } else if (asset === "base") {
    tokenMeta = { symbol: "GBYTE", decimals: 9, asset: "base" };
  } else if (data?.tokens?.[asset]) {
    tokenMeta = data.tokens[asset];
  } else {
    tokenMeta = { symbol: "UNKNOWN TOKEN", decimals: 0, asset: "unknown" };
  }

  if (!tokenMeta) throw new Error("Token meta not found");

  const reducer = asset === "base" ? appConfig.initialRewardsVariables.bytes_reducer : appConfig.initialRewardsVariables.deposit_asset_reducer

  return <div key={asset} className="first:mt-2">
    <div className="font-semibold">{toLocalString(balance / 10 ** tokenMeta.decimals)} {tokenMeta.symbol}</div>

    {asset !== "frd" ?
      <>
        <div className="text-sm text-muted-foreground">equivalent to {toLocalString(Number(equivalentInFrd / 10 ** frdToken.decimals).toPrecision(4))} {frdToken.symbol}

          <span>
            , {toLocalString(((equivalentInFrd * reducer) / 10 ** frdToken.decimals).toPrecision(4))} {frdToken.symbol} for rewards
          </span>

        </div>
      </> : null}
  </div>
}