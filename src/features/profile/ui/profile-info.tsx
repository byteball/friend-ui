import { FC } from "react";
import "server-only";

import { QRButton } from "@/components/ui/qr-button";
import { BOUNCE_FEES } from "@/constants";
import { generateLink } from "@/lib/generateLink";

import { ActiveUserLabel } from "./active-user-label";
import { ProfileShareLinks } from "./profile-share-links";

import { getProfileUsername } from "@/lib/getProfileUsername.server";
import { isActiveUser } from "@/lib/is-active-user";

import { appConfig } from "@/appConfig";
import { env } from "@/env";

interface ProfileInfoProps {
  address: string;
  userData?: IUserData;
}

export const ProfileInfo: FC<ProfileInfoProps> = async ({
  userData,
  address
}) => {
  const username = await getProfileUsername(address) ?? address.slice(0, 6) + "..." + address.slice(-4);
  const isActive = isActiveUser(userData);

  const connectUrl = generateLink({
    aa: appConfig.AA_ADDRESS,
    amount: BOUNCE_FEES,
    data: {
      connect: 1,
      friend: address
    }
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl first-letter:uppercase">
            {username}&apos;s profile
          </h1>

          <ActiveUserLabel isActive={isActive} />
        </div>

        <div className="flex flex-col items-end gap-2">
          <QRButton href={connectUrl} disabled={!isActive} variant="secondary">Add friend</QRButton>
          <small className="text-xs text-muted-foreground">Before sending a request, please contact {username} first</small>
        </div>
      </div>

      <ProfileShareLinks
        url={`${env.NEXT_PUBLIC_SITE_URL}/user/${address}`}
        title={`Become friends with ${username} on Obyte friends!`}
      />
    </>
  )
}