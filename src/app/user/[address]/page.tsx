import "server-only";

import { env } from "@/env";
import { FriendsList, ProfileInfo, ProfileStats } from "@/features/profile";
import { getFriendList } from "@/lib/calculations/get-friend-list";
import { getCeilingPrice, getTotalBalance } from "@/lib/calculations/get-rewards";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { isValidAddress } from "@/lib/is-valid-address";
import { toLocalString } from "@/lib/to-local-string";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';


export async function generateMetadata(
  { params }: { params: Promise<{ address: string }>; searchParams: Promise<Record<string, string | string[]>> }
): Promise<Metadata> {
  const { address } = await params;
  const username = await getProfileUsername(address) || "Anonymous";
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};

  const userData: IUserData | undefined = state?.[`user_${address}`];
  const friends = getFriendList(state, address);

  const ceilingPrice = getCeilingPrice(state.constants!);
  const totalBalance = await getTotalBalance(userData?.balances ?? {}, ceilingPrice);

  const frdTokenMeta = globalThis.__GLOBAL_STORE__?.getOwnToken();
  const frdDecimals = frdTokenMeta?.decimals ?? 9;
  const frdSymbol = frdTokenMeta?.symbol ?? "FRD";

  return ({
    title: `Obyte friends — ${username}`,
    description: `Profile of user ${username} in Obyte Friends: total ${friends.length} friends, ${toLocalString(totalBalance / 10 ** frdDecimals)} ${frdSymbol} locked`,
    openGraph: {
      images: [
        `/api/og/puzzle/${address}`,
      ]
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@ObyteOrg',
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  })
}

export default async function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  if (!address || !isValidAddress(address)) return <div>Address not provided</div>

  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};

  const userData: IUserData | undefined = state?.[`user_${address}`];

  const ceilingPrice = getCeilingPrice(state.constants!);
  const totalBalance = await getTotalBalance(userData?.balances ?? {}, ceilingPrice);

  return <div className="grid gap-y-5">
    <ProfileInfo address={address} userData={userData} />

    <div className="grid gap-4">
      <div>
        <a href={`https://city.obyte.org/user/${address}`} target="_blank" rel="noopener noreferrer" className="text-blue-700">Link on CITY profile</a>
      </div>
    </div>

    <ProfileStats
      address={address}
      totalBalance={totalBalance}
    />

    <FriendsList
      address={address}
    />
  </div>
}