import { addDays, isAfter, parseISO } from "date-fns";
import "server-only";

import { appConfig } from "@/appConfig";
import { DepositedLabel } from "@/components/layouts/deposited-label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";
import { BOUNCE_FEES } from "@/constants";
import { generateLink } from "@/lib/generateLink";
import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { toLocalString } from "@/lib/toLocalString";


export default async function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;

  if (!address) return <div>Address not provided</div>

  const username = await getProfileUsername(address).catch(() => address.slice(0, 6) + "..." + address.slice(-4));
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const userData: IUserData | undefined = state?.[`user_${address}`];
  const unlockDate = userData ? parseISO(userData.unlock_date) : null;
  const minLockedDate = unlockDate ? addDays(new Date(), appConfig.MIN_LOCKED_TERM_DAYS) : null;
  const isActive = minLockedDate && unlockDate ? isAfter(unlockDate, minLockedDate) : false;
  const currentGhostNum = userData?.current_ghost_num ?? 0;

  // Вынести в отдельную функцию
  const friends = Object.entries(state)
    .filter(([key]) => key.startsWith(`friend_${address}_`));


  const url = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    data: {
      connect: 1,
      friend: address
    }
  })


  return <div>
    <div className="flex items-center justify-between">
      <div className="flex space-x-4">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
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
          <div className="text-3xl mt-2">${toLocalString(4343)}</div>
          <div className="text-muted-foreground text-sm mt-2">Unlock date: {unlockDate?.toLocaleDateString()}</div>
        </CardContent>
      </Card>


      <Card>
        <CardContent>
          <CardTitle>Current ghost</CardTitle>
          <div className="text-3xl mt-2 text-green-700">Tim May <small>(Level {currentGhostNum})</small></div>
          <div className="text-sm mt-2"><a href="#">Address: Tim May St, Obyte City </a></div>
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
    </div>

    <div>
      <h2 className="text-2xl font-semibold mt-10 mb-4">Friend list</h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-semibold">Taump</div>
          <div>Live at <a href='#' className="text-red-700">Phil Zimmermann Avenue, 350847/W32126</a></div>
          <div className="text-muted-foreground">Friends since 2025-10-12</div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xl font-semibold">Tony</div>
          <div>Live at <a href='#' className="text-green-700">Tim May Street, 575381/N17929</a></div>
          <div className="text-muted-foreground">Friends since 2025-10-12</div>
        </div>
      </div>
    </div>
  </div >
}