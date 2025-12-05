"use client"

import { useGetCookie } from "cookies-next";
import { isAfter, parseISO } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { FC } from "react";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { WALLET_COOKIE_NAME } from "@/constants";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { formatDateAsUTC } from "@/lib/format-date-as-utc";
import { parseDateFromAA } from "@/lib/parse-date-from-aa";
import { toLocalString } from "@/lib/to-local-string";
import { GhostFriendsCard } from "../../ghost/ui/ghost-friends-card";
import { ProfileAssetsBalance } from "./profile-assets-balance";
import { ReplaceForm } from "./replace-form";
import { TotalBalanceChartCard } from "./total-balance-chart-card";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { QRButton } from "@/components/ui/qr-button";
import { generateLink } from "@/lib/generate-link";

interface ProfileStatsProps {
  address: string;
  totalBalance: number;
}

export const ProfileStats: FC<ProfileStatsProps> = ({ address, totalBalance }) => {
  const { state, getFrdToken, tokens } = useData();
  const getCookie = useGetCookie();

  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  const userData: IUserData | undefined = state?.[`user_${address}`];

  const { decimals: frdDecimals, symbol: frdSymbol } = getFrdToken();


  const liquidRewards = userData?.liquid_rewards ?? 0;
  const lockedRewards = userData?.locked_rewards ?? 0;

  const totalRewards = liquidRewards + lockedRewards; // newUserRewards are not included in locked rewards

  const friends = getFriendList(state, address);


  const unlockDate = userData?.unlock_date ? parseISO(userData.unlock_date) : undefined;

  const locked = unlockDate && userData && userData.unlock_date
    ? isAfter(userData.unlock_date, toZonedTime(new Date(), "UTC"))
    : false;

  const withdrawUrl = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    from_address: walletAddress || undefined,
    is_single: true,
    data: {
      withdraw: 1
    }
  })

  const depositAssetList = Object.keys(userData?.balances || {}).filter(asset => asset !== "frd").map(asset => tokens[asset].symbol).join("/") || "GBYTE";

  return <div className="grid grid-cols-6 gap-8 mt-10">
    <Card className="col-span-6 md:col-span-2">
      <CardContent>
        <CardTitle>Locked balance</CardTitle>
        <div className="mt-2 text-3xl">{toLocalString(Number(totalBalance / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small></div>

        {userData?.unlock_date ? <div className="mt-2 text-sm text-muted-foreground">
          Unlock date: {formatDateAsUTC(parseDateFromAA(userData.unlock_date))}
        </div> : null}
      </CardContent>
    </Card>

    <Card className="col-span-6 md:col-span-2">
      <CardContent>
        <CardTitle>Total rewards</CardTitle>
        <div className="mt-2 text-3xl">
          {toLocalString((totalRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small>
        </div>
        {userData?.last_date
          ? <div className="mt-2 text-sm text-muted-foreground">
            including {toLocalString((liquidRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} {frdSymbol} liquid</div>
          : null}
      </CardContent>
    </Card>

    <Card className="col-span-6 md:col-span-2">
      <CardContent>
        <CardTitle>Total friends</CardTitle>
        <div className="mt-2 text-3xl">{toLocalString(friends.length)}</div>
        {userData?.last_date
          ? <div className="mt-2 text-sm text-muted-foreground">
            Last: {" "}
            {formatDateAsUTC(parseDateFromAA(userData.last_date))}
          </div>
          : null}
      </CardContent>
    </Card>

    <GhostFriendsCard
      userData={userData}
      address={address}
    />

    {userData?.balances ? <TotalBalanceChartCard
      address={address}
    /> : null}

    {walletAddress === address && locked ? <Card className="col-span-6 md:col-span-3">
      <CardContent>
        <CardTitle>Replace</CardTitle>
        <CardDescription className="mt-2">You can replace your locked {depositAssetList} with {frdSymbol}</CardDescription>
        <div className="mt-4">
          <ReplaceForm
            address={address}
          />
        </div>
      </CardContent>
    </Card> : null}

    {walletAddress === address && userData && userData.balances ? <Card className="col-span-6 md:col-span-3">
      <CardContent className="h-full grow-0">
        <CardTitle>Balances</CardTitle>

        <div className="flex flex-col justify-between h-full pb-3">
          <ProfileAssetsBalance
            address={address}
            balances={userData?.balances ?? {}}
          />

          <div className="grid gap-y-2">
            <QRButton href={withdrawUrl} className="w-full" disabled={locked}>
              <div className="w-full">
                Withdraw
              </div>
            </QRButton>

            {userData?.unlock_date ? <div className="text-sm mt-1 text-muted-foreground">
              Unlock date: {formatDateAsUTC(parseDateFromAA(userData.unlock_date))}
            </div> : null}
          </div>
        </div>

      </CardContent>
    </Card> : null}

  </div>
}