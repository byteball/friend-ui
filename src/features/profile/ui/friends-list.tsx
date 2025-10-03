import { getFriendList } from "@/lib/calculations/getFriendList";
import { FC } from "react";
import "server-only";

import { FriendsListItem } from "./friends-list-item";

interface IFriendsListProps {
  username: string | null;
  address: string;
}

export const FriendsList: FC<IFriendsListProps> = ({ username, address }) => {
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};

  const friends = getFriendList(state, address);

  if (friends.length === 0) return null;

  return <>
    <h2 className="mt-10 mb-4 text-2xl font-semibold first-letter:uppercase">{username}&apos;s friends</h2>

    <div className="flex flex-col gap-6">
      {friends.map((friend) => <FriendsListItem
        key={friend.address}
        address={address}
        friendAddress={friend.address}
        date={friend.date}
      />)}
    </div>
  </>

}