"use client"

import { appConfig } from "@/app-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateLink } from "@/lib/generate-link";
import cn from "classnames";
import Image from 'rc-image';
import { FC } from "react";
import { getRequiredStreak } from "../domain/get-required-streak";
import { useUserGhost } from "../domain/use-user-ghost";

interface IGhostFriendsProps {
  userData?: IUserData;
  address: string;
}

export const GhostFriendsCard: FC<IGhostFriendsProps> = ({ userData, address }) => {
  const { data: {
    ghostName,
    ghostFriendIds,
    allGhosts
  }, isLoading } = useUserGhost(address);

  const requiredStreak = getRequiredStreak(userData?.current_ghost_num);

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    data: {
      friend: ghostName,
      connect: 1
    }
  });

  return (
    <Card className="col-span-3">
      <CardContent>
        <CardTitle>
          {isLoading ? <Skeleton className="w-full h-4" /> : <div>Become friends with the ghost of {ghostName}</div>}
        </CardTitle>
        <div className="flex justify-between mt-2 gap-8">
          <div className="mt-2 flex flex-col gap-1">

            <TooltipProvider>
              <div className="*:data-[slot=tooltip-trigger]:ring-background flex -space-x-2 *:data-[slot=tooltip-trigger]:ring-2 *:data-[slot=tooltip-trigger]:hover:z-10">

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
                  <div key={index} className="rounded-full overflow-hidden border-2 border-background ring-background ring-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {isLoading ? <div className="grid mt-4 gap-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
            </div> : <div className="mt-4 gap-2">
              <div>Current streak: {userData?.current_streak ?? 0} / {requiredStreak}</div>
              <div>Total streak: {userData?.total_streak ?? 0}</div>
            </div>}

            <div className="mt-4">
              {isLoading
                ? <Skeleton className="w-47 h-9" />
                : <QRButton href={url} disabled={isLoading || (userData?.current_streak ?? 0) < requiredStreak}>
                  Become friends
                </QRButton>}
            </div>

          </div>
          {isLoading ? <Skeleton className="w-[250px] h-[250px]" /> : <div className="w-[250px] h-[250px] relative bg-accent rounded-md overflow-hidden animate-pulse [&:has(img)]:animate-none">
            <Image
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
              src={`/api/puzzle/${address}?t=${Math.floor(Date.now() / (60 * 1000))}`} // cache buster every minute
              fallback="/ghosts/default.png"
              loading="eager"
              alt={ghostName}
            />
          </div>}
        </div>
      </CardContent>
    </Card>
  )
}