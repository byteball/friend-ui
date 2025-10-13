import "server-only";

import { env } from "@/env";
import { FriendsList, ProfileInfo, ProfileStats } from "@/features/profile";
import { ProfileShareLinks } from "@/features/profile/ui/profile-share-links";
import { getCeilingPrice, getTotalBalance } from "@/lib/calculations/getRewards";
import { isValidAddress } from "@/lib/isValidAddress";

export const dynamic = 'force-dynamic';

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


    <ProfileShareLinks
      url={`${env.NEXT_PUBLIC_SITE_URL}/user/${address}`}
      title="Description data"
    />


    <ProfileStats
      address={address}
      totalBalance={totalBalance}
    />

    <FriendsList
      address={address}
    />
  </div>
}