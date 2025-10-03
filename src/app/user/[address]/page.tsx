import { fromUnixTime, parseISO } from "date-fns";
import "server-only";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ProfileInfo } from "@/features/profile";
import { FriendsList } from "@/features/profile/ui/friends-list";
import { getFriendList } from "@/lib/calculations/getFriendList";
import { getFriendship } from "@/lib/calculations/getFriendship";
import { getCeilingPrice, getTotalBalance } from "@/lib/calculations/getRewards";
import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { isValidAddress } from "@/lib/isValidAddress";
import { toLocalString } from "@/lib/toLocalString";
import { ActivityProgress } from "./components/activity-progress";

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  if (!address || !isValidAddress(address)) return <div>Address not provided</div>

  const username = await getProfileUsername(address)
    .catch(() => address.slice(0, 6) + "..." + address.slice(-4));

  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const tokens = globalThis.__GLOBAL_STORE__?.getTokens() ?? {};

  const userData: IUserData | undefined = state?.[`user_${address}`];
  const unlockDate = userData ? parseISO(userData.unlock_date) : null;

  const ceilingPrice = getCeilingPrice(state.constants!);
  const totalBalance1 = await getTotalBalance(userData?.balances ?? {}, ceilingPrice);
  const frdAsset = state.constants?.asset;
  const { symbol: frdSymbol = "FRD", decimals: frdDecimals = 9 } = tokens[frdAsset ?? ''] ?? {};
  const friends = getFriendList(state, address);

  const liquidRewards = userData?.liquid_rewards ?? 0;
  const lockedRewards = userData?.locked_rewards ?? 0;
  const newUserRewards = userData?.new_user_rewards ?? 0;
  const totalRewards = liquidRewards + lockedRewards + newUserRewards;
  const rewards = getFriendship(state, address);

  return <div>

    <ProfileInfo
      username={username}
      address={address}
      userData={userData}
    />

    <div className="grid gap-4 mt-5">
      <div>
        <a href={`https://city.obyte.org/user/${address}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">Link on CITY profile</a>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-8 mt-10">
      <Card>
        <CardContent>
          <CardTitle>Total balance</CardTitle>
          <div className="mt-2 text-3xl">{toLocalString(Number(totalBalance1 / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small></div>
          <div className="mt-2 text-sm text-muted-foreground">Unlock date: {unlockDate?.toLocaleDateString()}</div>
        </CardContent>
      </Card>


      {/* <Card>
        <CardContent>
          <CardTitle>Current ghost</CardTitle>
          <div className="mt-2 text-3xl text-green-700">Tim May <small>(Level {currentGhostNum})</small></div>
          <div className="mt-2 text-sm"><a href="#">Address: Tim May St, Obyte City </a></div>
        </CardContent>
      </Card> */}

      <Card>
        <CardContent>
          <CardTitle>Total rewards</CardTitle>
          <div className="mt-2 text-3xl">
            {toLocalString((totalRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small>
          </div>
          {userData?.last_date
            ? <div className="mt-2 text-sm text-muted-foreground">
              including {toLocalString((lockedRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} locked</div>
            : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Total friends</CardTitle>
          <div className="mt-2 text-3xl">{toLocalString(friends.length)}</div>
          {userData?.last_date
            ? <div className="mt-2 text-sm text-muted-foreground">
              Last friend activity: {userData?.last_date}</div>
            : null}
        </CardContent>
      </Card>

      <ActivityProgress user={userData} />
    </div>


    <FriendsList
      address={address}
    />

    {rewards.length ? <div>
      <h2 className="mt-10 mb-4 text-2xl font-semibold first-letter:uppercase">{username}&apos;s rewards</h2>

      <div className="grid gap-4">
        {rewards.map((f => <div key={f.index + f.accept_ts} className="p-4 border rounded-md">
          At <span className="text-muted-foreground">{fromUnixTime(f.accept_ts).toLocaleString()}</span>, {username} received an {f.index.split('_').join(" #")} reward: {toLocalString(f.liquid! / 10 ** frdDecimals)} <small>{frdSymbol}</small> (liquid) + {toLocalString((f.locked ?? 0) / 10 ** frdDecimals)} <small>{frdSymbol}</small> (locked){f.new_user_reward ? <> + {toLocalString(f.new_user_reward / 10 ** frdDecimals)} <small>{frdSymbol}</small> (new user)</> : '.'}
        </div>))}
      </div>
    </div> : null}

  </div>
}