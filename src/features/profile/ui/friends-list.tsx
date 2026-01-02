import { getFriendList } from "@/lib/calculations/get-friend-list";
import { FC } from "react";
import "server-only";

import { getProfileUsername } from "@/lib/get-profile-username.server";
import { isValidAddress } from "@/lib/is-valid-address";
import { FriendsListItem } from "./friends-list-item";

interface IFriendsListProps {
  address: string;
}

export const FriendsList: FC<IFriendsListProps> = async ({ address }) => {
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const username = await getProfileUsername(address) ?? address.slice(0, 6) + "..." + address.slice(-4);
  const friends = getFriendList(state, address);
  const { symbol, decimals } = globalThis.__GLOBAL_STORE__?.getOwnToken() ?? { decimals: 9, symbol: "unknown" };

  if (friends.length === 0) return null;

  return <>
    <h2 className="mt-10 text-2xl font-semibold first-letter:uppercase">
      {username}&apos;s friends ({friends.length})
    </h2>

    <div className="flex flex-col gap-6">
      {friends.map((friend) => <FriendsListItem
        key={friend.address}
        frdAssetDecimals={decimals}
        frdAssetSymbol={symbol}
        isGhost={!isValidAddress(friend.address)}
        rewards={friend.rewards}
        friendAddress={friend.address}
        date={friend.date}
        isReferrer={friend.isReferrer}
      />)}
    </div>
  </>

}