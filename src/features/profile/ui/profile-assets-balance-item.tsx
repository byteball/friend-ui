"use client"

import { FC, use } from "react";

import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { toLocalString } from "@/lib/to-local-string";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";

interface ProfileAssetBalanceItemProps {
  address: string;
  asset: string;
  rateGetter: Promise<{ min: number; max: number }>;
}

export const ProfileAssetBalanceItem: FC<ProfileAssetBalanceItemProps> = ({ address, asset, rateGetter }) => {
  const data = useData();
  const frdToken = data.getFrdToken();

  const userData = data.state[`user_${address}`] as IUserData | undefined;
  const balance = userData?.balances?.[asset] ?? 0;
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

  return <div key={asset} className="first:mt-2">
    <div>{toLocalString(balance / 10 ** tokenMeta.decimals)} {tokenMeta.symbol}</div>
    <div className="text-sm text-muted-foreground">equivalent to {toLocalString(equivalentInFrd / 10 ** frdToken.decimals)} {frdToken.symbol}, {toLocalString(((equivalentInFrd - equivalentInFrd * appConfig.initialRewardsVariables.deposit_asset_reducer) / 10 ** frdToken.decimals))} {frdToken.symbol} for rewards</div>
  </div>
}