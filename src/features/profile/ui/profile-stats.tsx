"use client"

import { useGetCookie } from "cookies-next";
import { isAfter, parseISO } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { FC, Suspense, useState } from "react";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { WALLET_COOKIE_NAME } from "@/constants";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { formatDateAsUTC } from "@/lib/format-date-as-utc";
import { parseDateFromAA } from "@/lib/parse-date-from-aa";
import { toLocalString } from "@/lib/to-local-string";
import { GhostFriendsCard } from "../../ghost/ui/ghost-friends-card";
import { ReplaceForm } from "./replace-form";
import { TotalBalanceChartCard } from "./total-balance-chart-card";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRButton } from "@/components/ui/qr-button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateLink } from "@/lib/generate-link";
import { executeGetter } from "@/lib/http-client";
import cn from "classnames";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { sortBalancesByPriority } from "../utils/sort-balances-by-priority";
import { ProfileAssetBalanceItem } from "./profile-assets-balance-item";

interface ProfileStatsProps {
  address: string;
  totalBalance: number;
}

export const ProfileStats: FC<ProfileStatsProps> = ({ address, totalBalance }) => {
  const { state, getFrdToken, tokens } = useData();
  const [collapsedTotalBalance, setCollapsedTotalBalance] = useState(true);

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

  const showCollapse = Object.keys(userData?.balances || {}).length > 1;

  return <div className="grid grid-cols-6 gap-8 mt-10">
    {walletAddress !== address ? <div className="col-span-6">
      <Link href={`/?friend_address=${address}`} className="text-lg">
        Become my friend and make {toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100)}% a day by making friends every day {" "}
        <ChevronRight className="inline" />
      </Link>
    </div> : null}

    <Card className="col-span-6 md:col-span-3 lg:col-span-2">
      <CardContent>
        <CardTitle>Total balance</CardTitle>
        <Collapsible open={!collapsedTotalBalance} onOpenChange={() => setCollapsedTotalBalance(!collapsedTotalBalance)}>
          <CollapsibleTrigger asChild className="mt-2 text-2xl lg:text-3xl">
            <div className={cn(showCollapse ? "cursor-pointer select-none" : "")}>
              {toLocalString(Number((totalBalance || 0) / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small>
              {showCollapse ? <>
                {collapsedTotalBalance
                  ? <ChevronDown className="inline-block ml-2 transition-transform duration-200 rotate-0" size={24} />
                  : <ChevronDown className="inline-block ml-2 transition-transform duration-200 -rotate-180" size={24} />}
              </> : null}
            </div>

          </CollapsibleTrigger>

          <CollapsibleContent className="grid gap-3 mt-2 text-sm CollapsibleContent">
            <Separator orientation="horizontal" className="w-full mt-2" />

            {Object.entries(userData?.balances || [])
              .sort(sortBalancesByPriority)
              .map(([asset, balance]) => (
                <Suspense fallback={<div className="grid gap-1">
                  <Skeleton className="w-full h-6" />
                  <Skeleton className="w-full h-10" />
                </div>} key={asset}>
                  <ProfileAssetBalanceItem
                    asset={asset}
                    balance={balance ?? 0}
                    address={address}
                    rateGetter={asset === "base" || asset === "frd"
                      ? new Promise(r => r({ min: 0, max: 0 }))
                      : executeGetter(appConfig.AA_ADDRESS, 'get_deposit_asset_exchange_rates', [asset]) as Promise<{ min: number; max: number }>
                    }
                  />
                </Suspense>
              ))}
          </CollapsibleContent>
        </Collapsible>

        {userData?.unlock_date ? <div className="flex items-center justify-between mt-2">
          <div className="text-md text-muted-foreground">
            Unlock date: {formatDateAsUTC(parseDateFromAA(userData.unlock_date))}
          </div>

          {walletAddress === address && userData && userData?.balances ? <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <QRButton disabled={locked} href={withdrawUrl} className="p-0 m-0 text-sm" variant="link">
                      Withdraw
                    </QRButton>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[350px]">
                  <p>Will become available on the unlock date</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div> : null}
        </div> : null}
      </CardContent>
    </Card>

    <Card className="col-span-6 md:col-span-3 lg:col-span-2">
      <CardContent>
        <CardTitle>Total rewards</CardTitle>
        <div className="mt-2 text-3xl">
          {toLocalString((totalRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small>
        </div>

        {userData?.liquid_rewards
          ? <div className="mt-2 text-md text-muted-foreground">
            including {toLocalString((liquidRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} {frdSymbol} liquid</div>
          : null}

        {userData?.new_user_rewards
          ? <div className="mt-2 text-md text-muted-foreground">
            including {toLocalString(((userData.new_user_rewards ?? 0) / 10 ** frdDecimals).toPrecision(frdDecimals))} {frdSymbol} for new users</div>
          : null}
      </CardContent>
    </Card>

    <Card className="col-span-6 md:col-span-3 lg:col-span-2">
      <CardContent>
        <CardTitle>Total friends</CardTitle>
        <div className="mt-2 text-3xl">{toLocalString(friends.length)}</div>

        {userData?.new_users
          ? <div className="mt-2 text-md text-muted-foreground">
            including {toLocalString(userData.new_users)} new user{userData.new_users !== 1 ? "s" : ""}</div>
          : null}

        {userData?.last_date
          ? <div className="mt-2 text-md text-muted-foreground">
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

    {walletAddress === address && locked ? <Card className="col-span-6 lg:col-span-3">
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
  </div>
}