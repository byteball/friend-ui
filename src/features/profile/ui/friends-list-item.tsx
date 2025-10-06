import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { fromUnixTime } from "date-fns";
import { FC } from "react";
import "server-only";

interface IFriendsListItemProps {
  friendAddress: string;
  date: number;
}

export const FriendsListItem: FC<IFriendsListItemProps> = async ({ friendAddress, date }) => {
  const username = await getProfileUsername(friendAddress) ?? friendAddress.slice(0, 6) + "..." + friendAddress.slice(-4);

  return <div className="flex flex-col gap-2">
    <div className="text-xl font-semibold first-letter:uppercase">{username}</div>

    <div>Lives at <a href={`https://city.obyte.org/user/${friendAddress}`} className="text-red-700">Phil Zimmermann Avenue, 350847/W32126</a></div>
    <div className="text-muted-foreground">{fromUnixTime(date).toLocaleDateString()}</div>
  </div>

}