"use client"

import { useData } from "@/app/context";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { formatDateAsUTC } from "@/lib/format-date-as-utc";
import { parseDateFromAA } from "@/lib/parse-date-from-aa";
import { toLocalString } from "@/lib/to-local-string";
import { FC } from "react";
import { GhostFriendsCard } from "../../ghost/ui/ghost-friends-card";
import { TotalBalanceChartCardProps } from "./total-balance-chart-card";

interface ProfileStatsProps {
  address: string;
  totalBalance: number;
}

export const ProfileStats: FC<ProfileStatsProps> = ({ address, totalBalance }) => {
  const { state, getFrdToken } = useData();

  const userData: IUserData | undefined = state?.[`user_${address}`];

  const { decimals: frdDecimals, symbol: frdSymbol } = getFrdToken();


  const liquidRewards = userData?.liquid_rewards ?? 0;
  const lockedRewards = userData?.locked_rewards ?? 0;
  const newUserRewards = userData?.new_user_rewards ?? 0;
  const totalRewards = liquidRewards + lockedRewards + newUserRewards;

  const friends = getFriendList(state, address);

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
          ? <>
            <div className="mt-2 text-sm text-muted-foreground">
              including {toLocalString((lockedRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} {frdSymbol} locked</div>
            <div className="mt-2 text-sm text-muted-foreground">
              including {toLocalString((liquidRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} {frdSymbol} liquid</div>
          </>
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

    <TotalBalanceChartCardProps
      address={address}
    />
  </div>
}