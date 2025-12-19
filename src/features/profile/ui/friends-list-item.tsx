import cn from "classnames";
import Link from "next/link";
import { FC } from "react";
import "server-only";

import { IFriendRewards } from "@/lib/calculations/get-friend-list";
import { formatDateAsUTC } from "@/lib/format-date-as-utc";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { toLocalString } from "@/lib/to-local-string";

interface IFriendsListItemProps {
  friendAddress: string;
  date: number;
  isGhost: boolean;
  frdAssetDecimals: number;
  frdAssetSymbol: string;
  rewards: IFriendRewards;
}

export const FriendsListItem: FC<IFriendsListItemProps> = async ({ friendAddress, rewards, frdAssetDecimals, frdAssetSymbol: frdSmb, date, isGhost = false }) => {
  const username = isGhost ? friendAddress : await getProfileUsername(friendAddress) ?? friendAddress.slice(0, 6) + "..." + friendAddress.slice(-4);

  const cns = "text-xl font-semibold first-letter:uppercase";

  const liquidRewardsView = toLocalString((rewards.liquid || 0) / 10 ** frdAssetDecimals)
  const lockedRewardsView = toLocalString(((rewards.locked || 0) + (rewards.new_user_reward || 0)) / 10 ** frdAssetDecimals);

  const hasNewUserReward = rewards.new_user_reward > 0;
  const newUserRewardView = hasNewUserReward ? toLocalString((rewards.new_user_reward || 0) / 10 ** frdAssetDecimals) : null;

  return <div className="flex flex-col gap-2">
    {isGhost
      ? <div className={cns}>{username}</div>
      : <div>
        <Link
          href={`/${friendAddress}`}
          className={cn(cns, "text-white underline underline-offset-3 inline")}
        >
          {username}
        </Link>
      </div>}
    <div className="text-muted-foreground">Became friends on {formatDateAsUTC(new Date(date * 1000))}, rewards:    {liquidRewardsView} {frdSmb} liquid,{" "}
      {lockedRewardsView} {frdSmb} locked {hasNewUserReward ? `(including ${newUserRewardView} ${frdSmb} new user reward)` : null}
    </div>
  </div>
}