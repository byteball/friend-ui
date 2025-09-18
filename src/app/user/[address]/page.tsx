import { addDays, fromUnixTime, isAfter, parseISO } from "date-fns";
import "server-only";

import { appConfig } from "@/appConfig";
import { DepositedLabel } from "@/components/layouts/deposited-label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";
import { BOUNCE_FEES } from "@/constants";
import { getFriendList } from "@/lib/calculations/getFriendList";
import { getFriendship } from "@/lib/calculations/getFriendship";
import { getCeilingPrice, getTotalBalance } from "@/lib/calculations/getRewards";
import { generateLink } from "@/lib/generateLink";
import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { toLocalString } from "@/lib/toLocalString";


export default async function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  if (!address) return <div>Address not provided</div>

  const username = await getProfileUsername(address).catch(() => address.slice(0, 6) + "..." + address.slice(-4));
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const tokens = globalThis.__GLOBAL_STORE__?.getTokens() ?? {};

  const userData: IUserData | undefined = state?.[`user_${address}`];
  const unlockDate = userData ? parseISO(userData.unlock_date) : null;
  const minLockedDate = unlockDate ? addDays(new Date(), appConfig.MIN_LOCKED_TERM_DAYS) : null;
  const isActive = minLockedDate && unlockDate ? isAfter(unlockDate, minLockedDate) : false;
  // const currentGhostNum = userData?.current_ghost_num ?? 0;

  const ceilingPrice = getCeilingPrice(state.constants!);
  const totalBalance1 = await getTotalBalance(userData?.balances ?? {}, ceilingPrice);
  const frdAsset = state.constants?.asset;
  const { symbol: frdSymbol = "FRD", decimals: frdDecimals = 9 } = tokens[frdAsset ?? ''] ?? {};
  const friends = getFriendList(state, address);

  const attestationGetters = friends.map((f) => getProfileUsername(f.address).then((username) => ({ ...f, username })))
  const friendsWithUsernames = await Promise.all(attestationGetters);

  const liquidRewards = userData?.liquid_rewards ?? 0;
  const lockedRewards = userData?.locked_rewards ?? 0;
  const newUserRewards = userData?.new_user_rewards ?? 0;
  const totalRewards = liquidRewards + lockedRewards + newUserRewards;
  const rewards = getFriendship(state, address);

  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    data: {
      connect: 1,
      friend: address
    }
  })

  console.log('userData', userData);

  return <div>
    <div className="flex items-center justify-between">
      <div className="flex space-x-4">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl first-letter:uppercase">
          {username}'s profile
        </h1>

        <DepositedLabel deposited={isActive} />

      </div>

      <div className="flex items-end flex-col gap-2">
        <QRButton href={url} disabled={!isActive} variant="secondary">Add friend</QRButton>
        <small className="text-muted-foreground text-xs">Before sending a request, please contact {username} first</small>
      </div>
    </div>

    <div className="grid gap-4 mt-5">
      <div>
        <a href={`https://city.obyte.org/user/${address}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">Link on CITY profile</a>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-8 mt-10">
      <Card>
        <CardContent>
          <CardTitle>Total balance</CardTitle>
          <div className="text-3xl mt-2">{toLocalString(Number(totalBalance1 / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small></div>
          <div className="text-muted-foreground text-sm mt-2">Unlock date: {unlockDate?.toLocaleDateString()}</div>
        </CardContent>
      </Card>


      {/* <Card>
        <CardContent>
          <CardTitle>Current ghost</CardTitle>
          <div className="text-3xl mt-2 text-green-700">Tim May <small>(Level {currentGhostNum})</small></div>
          <div className="text-sm mt-2"><a href="#">Address: Tim May St, Obyte City </a></div>
        </CardContent>
      </Card> */}

      <Card>
        <CardContent>
          <CardTitle>Total rewards</CardTitle>
          <div className="text-3xl mt-2">
            {toLocalString((totalRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} <small>{frdSymbol}</small>
          </div>
          {userData?.last_date
            ? <div className="text-muted-foreground text-sm mt-2">
              including {toLocalString((lockedRewards / 10 ** frdDecimals).toPrecision(frdDecimals))} locked</div>
            : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Total friends</CardTitle>
          <div className="text-3xl mt-2">{toLocalString(friends.length)}</div>
          {userData?.last_date
            ? <div className="text-muted-foreground text-sm mt-2">
              Last friend activity: {userData?.last_date}</div>
            : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Total streak</CardTitle>
          <div className="text-3xl mt-2">{toLocalString(userData?.total_streak ?? 0)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Current streak</CardTitle>
          <div className="text-3xl mt-2">{toLocalString(userData?.current_streak ?? 0)}</div>
        </CardContent>
      </Card>

    </div>

    {friends.length ? <div>
      <h2 className="text-2xl font-semibold mt-10 mb-4 first-letter:uppercase">{username}&apos;s friends</h2>

      <div className="flex flex-col gap-6">
        {friendsWithUsernames.map(f => <div key={f.date + f.address} className="flex flex-col gap-2">
          <div className="text-xl font-semibold first-letter:uppercase">{f.username}</div>
          {/* TODO: real CITY address */}
          <div>Lives at <a href={`https://city.obyte.org/user/${f.address}`} className="text-red-700">Phil Zimmermann Avenue, 350847/W32126</a></div>
          <div className="text-muted-foreground">{fromUnixTime(f.date).toLocaleDateString()}</div>
        </div>)}
      </div>
    </div> : null}

    <div>
      <h2 className="text-2xl font-semibold mt-10 mb-4 first-letter:uppercase">{username}&apos;s rewards</h2>

      <div className="grid gap-4">
        {rewards.map((f => <div key={f.index + f.accept_ts} className="p-4 border rounded-md">
          At <span className="text-muted-foreground">{fromUnixTime(f.accept_ts).toLocaleString()}</span>, {username} received an {f.index.split('_').join(" #")} reward: {toLocalString(f.liquid! / 10 ** frdDecimals)} <small>{frdSymbol}</small> (liquid) + {toLocalString((f.locked ?? 0) / 10 ** frdDecimals)} <small>{frdSymbol}</small> (locked){f.new_user_reward ? <> + {toLocalString(f.new_user_reward / 10 ** frdDecimals)} <small>{frdSymbol}</small> (new user)</> : '.'}
        </div>))}
      </div>
    </div>

  </div>
}