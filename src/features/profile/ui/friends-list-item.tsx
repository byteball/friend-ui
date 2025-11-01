import { FC } from "react";
import "server-only";

import { formatDateAsUTC } from "@/lib/format-date-as-utc";
import { getProfileUsername } from "@/lib/get-profile-username.server";

interface IFriendsListItemProps {
  friendAddress: string;
  date: number;
  isGhost: boolean;
}

export const FriendsListItem: FC<IFriendsListItemProps> = async ({ friendAddress, date, isGhost = false }) => {
  const username = isGhost ? friendAddress : await getProfileUsername(friendAddress) ?? friendAddress.slice(0, 6) + "..." + friendAddress.slice(-4);

  return <div className="flex flex-col gap-2">
    <div className="text-xl font-semibold first-letter:uppercase">{username}</div>

    {!isGhost && <div>Lives at <a href={`https://city.obyte.org/user/${friendAddress}`} className="text-red-700">
      Phil Zimmermann Avenue, 350847/W32126</a>
    </div>}

    <div className="text-muted-foreground">{formatDateAsUTC(new Date(date * 1000))}</div>
  </div>

}