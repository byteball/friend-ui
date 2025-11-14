import cn from "classnames";
import Link from "next/link";
import { FC } from "react";
import "server-only";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

export const FriendsListItem: FC<IFriendsListItemProps> = async ({ friendAddress, rewards, frdAssetDecimals, frdAssetSymbol, date, isGhost = false }) => {
  const username = isGhost ? friendAddress : await getProfileUsername(friendAddress) ?? friendAddress.slice(0, 6) + "..." + friendAddress.slice(-4);
  const totalRewards = (rewards.liquid || 0) + (rewards.locked || 0) + (rewards.new_user_reward || 0);

  const cns = "text-xl font-semibold first-letter:uppercase";

  return <div className="flex flex-col gap-2">
    {isGhost
      ? <div className={cns}>{username}</div>
      : <div>
        <Link
          href={`/user/${friendAddress}`}
          className={cn(cns, "text-blue-700 inline")}
        >
          {username}
        </Link>
      </div>}
    <div className="text-muted-foreground">Became friends on {formatDateAsUTC(new Date(date * 1000))} and brought <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="underline underline-offset-4 text-black decoration-dotted">
            {toLocalString(totalRewards / 10 ** frdAssetDecimals)} {frdAssetSymbol}
          </span>
        </TooltipTrigger>

        <TooltipContent>
          <div>
            <div>Liquid rewards: {toLocalString((rewards.liquid || 0) / 10 ** frdAssetDecimals)} {frdAssetSymbol}</div>
            <div>Locked rewards: {toLocalString((rewards.locked || 0) / 10 ** frdAssetDecimals)} {frdAssetSymbol}</div>
            <div>New user reward: {toLocalString((rewards.new_user_reward || 0) / 10 ** frdAssetDecimals)} {frdAssetSymbol}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
      {" "} rewards
    </div>
  </div>
}