import { FC, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { executeGetter } from "@/lib/http-client";
import { ProfileAssetBalanceItem } from "./profile-assets-balance-item";

import { appConfig } from "@/app-config";

interface ProfileAssetsBalanceProps {
  address: string;
  balances: Record<string, number>;
}

export const ProfileAssetsBalance: FC<ProfileAssetsBalanceProps> = ({ address, balances }) => (<div className="grid gap-4">
  {Object.entries(balances).map(([asset, balance]) => {
    return <Suspense
      key={asset}
      fallback={<Skeleton className="w-full mt-4 rounded-md h-11" />}
    >
      <ProfileAssetBalanceItem
        asset={asset}
        balance={balance ?? 0}
        address={address}
        rateGetter={asset === "base" || asset === "frd" ? new Promise(r => r({ min: 0, max: 0 })) : executeGetter(appConfig.AA_ADDRESS, 'get_deposit_asset_exchange_rates', [asset]) as Promise<{ min: number; max: number }>}
      />
    </Suspense>
  })}
</div>)