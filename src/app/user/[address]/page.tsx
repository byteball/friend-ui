import "server-only";

import { FriendsList, ProfileInfo, ProfileStats } from "@/features/profile";
import { getCeilingPrice, getTotalBalance } from "@/lib/calculations/getRewards";
import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { isValidAddress } from "@/lib/isValidAddress";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';


export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ address: string }>; searchParams: Promise<Record<string, string | string[]>> }
): Promise<Metadata> {
  const { address } = await params;
  const username = await getProfileUsername(address) || "Anonymous";

  return ({
    title: `${username}' profile'`,
    description: `View the profile and stats of user ${address} on Obyte Friend.`,
    openGraph: {
      images: [
        `/api/og-puzzle/${address}`,
      ]
    }
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