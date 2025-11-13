import Link from "next/link";
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

  const cns = "text-xl font-semibold first-letter:uppercase";

  return <div className="flex flex-col gap-2">
    {isGhost
      ? <div className={cns}>{username}</div>
      : <Link href={`/user/${friendAddress}`} className={cns}>{username}</Link>}
    <div className="text-muted-foreground">{formatDateAsUTC(new Date(date * 1000))}</div>
  </div>

}