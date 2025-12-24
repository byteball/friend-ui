"use client"

import "client-only";

import { appConfig } from "@/app-config";
import { CardFooterReferral } from "@/components/layouts/card-footer-refferal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WALLET_COOKIE_NAME } from "@/constants";
import { generateLink } from "@/lib/generate-link";
import cn from "classnames";
import { useReactiveGetCookie } from "cookies-next";
import Image from 'rc-image';
import { FC } from "react";
import { getRequiredStreak } from "../domain/get-required-streak";
import { useUserGhost } from "../domain/use-user-ghost";
import { SelectGhostModal } from "./select-ghost-modal";

interface IGhostFriendsProps {
  userData?: IUserData;
  address: string;
}

export const GhostFriendsCard: FC<IGhostFriendsProps> = ({ userData, address }) => {
  const { data: {
    ghostName,
    ghostFriendIds,
    allGhosts,
  }, isLoading } = useUserGhost(address);

  const requiredStreak = getRequiredStreak(userData?.current_ghost_num);
  const getCookie = useReactiveGetCookie();
  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    from_address: walletAddress,
    data: {
      friend: ghostName,
      connect: 1
    }
  });

  return (
    <Card className="col-span-6 lg:col-span-3">
      <CardHeader>
        <CardTitle className="min-h-12">
          {isLoading
            ? <Skeleton className="w-[calc(100%-20px)] h-12" />
            : <div className="max-w-lg leading-6">On {userData?.current_streak || 0} out of {requiredStreak} days streak to become friends with the ghost of {ghostName}</div>}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn({
          "min-h-[270px]": address === walletAddress,
          "min-h-60": address !== walletAddress
        })}
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div className="flex flex-col mt-2">

            <TooltipProvider>
              <div className="*:data-[slot=tooltip-trigger]:ring-[#60A5FA] flex -space-x-2 *:data-[slot=tooltip-trigger]:ring-2 *:data-[slot=tooltip-trigger]:hover:z-10">

                {!isLoading ? allGhosts.map((g, index) => <Tooltip key={g.name}>
                  <TooltipTrigger asChild>
                    <Avatar className={cn({ "grayscale opacity-90": !ghostFriendIds.includes(index) })}>
                      <AvatarImage src={g.image} alt={g.name} />
                      <AvatarFallback>{g.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{g.name}</p>
                  </TooltipContent>
                </Tooltip>) : Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="overflow-hidden border-2 rounded-full ring-[#60A5FA] ring-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {isLoading ? <div className="grid gap-2 mt-4">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div> : <div className="gap-2 mt-4">
              <div>Current streak: {userData?.current_streak || 0} / {requiredStreak} days</div>
              <div>Total streak: {userData?.total_streak || 0} day(s)</div>
            </div>}

            {address === walletAddress ? <div className="mt-4">
              {isLoading
                ? <Skeleton className="w-47 h-9" />
                : <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <QRButton href={url} disabled={isLoading || (userData?.current_streak || 0) < requiredStreak}>
                        Become friends
                      </QRButton>
                    </div>
                  </TooltipTrigger>
                  {((userData?.current_streak || 0) < requiredStreak) && <TooltipContent>
                    <p>
                      You need to complete the <b>{requiredStreak}-day</b> streak to become friends with <b>{ghostName}</b>
                    </p>
                  </TooltipContent>}
                </Tooltip>}
            </div> : null}
          </div>

          {isLoading
            ? <div className="flex justify-center w-full lg:w-auto lg:justify-end">
              <Skeleton className="w-full max-w-[230px] aspect-square" />
              {address === walletAddress ? <Skeleton className="w-full h-9" /> : null}
            </div>
            : <div className="flex flex-col items-center w-full text-center lg:w-auto lg:items-end">
              <div className="border p-2 w-full max-w-[230px] aspect-square relative bg-accent rounded-md overflow-hidden animate-pulse [&:has(img)]:animate-none">
                <Image
                  wrapperClassName="w-full h-full"
                  className="object-cover w-full h-full"
                  src={`/api/puzzle/${address}?t=${Math.floor(Date.now() / (60 * 1000))}`} // cache buster every minute
                  fallback="/ghosts/default.png"
                  loading="eager"
                  alt={ghostName}
                />
              </div>

              {address === walletAddress && <SelectGhostModal address={address}>
                <Button variant="link" className="mx-auto">choose another next ghost</Button>
              </SelectGhostModal>}
            </div>}
        </div>
      </CardContent>

      {address === walletAddress ? <CardFooterReferral
        hasDeposit={!!userData?.balances}
        address={address}
        query=""
        type="streak"
      /> : null}
    </Card >
  )
}