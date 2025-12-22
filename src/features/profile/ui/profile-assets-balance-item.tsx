"use client"

import { FC, use } from "react";

import { getCeilingPrice } from "@/lib/calculations/get-rewards";
import { toLocalString } from "@/lib/to-local-string";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { WALLET_COOKIE_NAME } from "@/constants";
import { useReactiveGetCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { scroller } from "react-scroll";

interface ProfileAssetBalanceItemProps {
  address: string;
  asset: string;
  balance: number;
  rateGetter: Promise<{ min: number; max: number }>;
}

export const ProfileAssetBalanceItem: FC<ProfileAssetBalanceItemProps> = ({
  asset,
  rateGetter,
  balance,
  address,
}) => {
  const data = useData();
  const frdToken = data.getFrdToken();
  const router = useRouter();
  const getCookie = useReactiveGetCookie();
  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  const rate = use(rateGetter);
  const ceilingPrice = getCeilingPrice(data.state.constants);

  const assetRate = rate.max ?? 0;
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

  const reducer = asset === "base" ? appConfig.initialRewardsVariables.bytes_reducer : appConfig.initialRewardsVariables.deposit_asset_reducer;

  const replace = () => {
    if (asset === "frd") return; // cannot replace frd

    router.replace(`/${address}?replace=${encodeURIComponent(asset)}`);

    scroller.scrollTo('replace-form', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }

  return <div key={asset} className="first:mt-2">
    <div className="font-semibold text-md">{toLocalString(balance / 10 ** tokenMeta.decimals)} {tokenMeta.symbol}</div>

    {asset !== "frd" ?
      <>
        <div className="text-sm text-muted-foreground">equivalent to {toLocalString(Number(equivalentInFrd / 10 ** frdToken.decimals).toPrecision(4))} {frdToken.symbol}
          <span>
            , {toLocalString(((equivalentInFrd * reducer) / 10 ** frdToken.decimals).toPrecision(4))}{" "}
            {frdToken.symbol} for rewards
          </span>

          {asset !== "frd" && walletAddress === address
            ? <> <span className="cursor-pointer" onClick={replace}>(replace)</span></>
            : null}
        </div>
      </> : null}
  </div>
}