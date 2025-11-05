"use client"

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { QRButton } from "@/components/ui/qr-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateLink } from "@/lib/generate-link";
import Image from 'rc-image';
import { FC } from "react";
import { getGhostsFromVars } from "../../profile/domain/get-ghosts-from-vars";

interface IGhostFriendsProps {
  userData?: IUserData;
  address: string;
}

export const GhostFriendsCard: FC<IGhostFriendsProps> = ({ userData, address }) => {
  const data = useData();
  const ghosts = getGhostsFromVars(data.state);

  // const currentGhost = ghosts.find(g => g.name === ghostName);
  const requiredStreak = ((userData?.current_ghost_num ?? 1) + 1) ** 2;

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS,
    data: {
      friend: "Tim May",
      connect: 1
    }
  });

  return (
    <Card className="col-span-3">
      <CardContent>
        <CardTitle>
          Become friends with the ghost
        </CardTitle>
        {/* <CardTitle>
          Become friends with the ghost of {ghostName}
        </CardTitle> */}
        <div className="flex justify-between mt-2 gap-8">
          <div className="mt-2 flex flex-col gap-1">

            <TooltipProvider>
              <div className="*:data-[slot=tooltip-trigger]:ring-background flex -space-x-2 *:data-[slot=tooltip-trigger]:ring-2 *:data-[slot=tooltip-trigger]:hover:z-10">

                {ghosts.map(g => <Tooltip key={g.name}>
                  <TooltipTrigger asChild>
                    <Avatar>
                      <AvatarImage src={g.image} alt={g.name} />
                      <AvatarFallback>{g.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{g.name}</p>
                  </TooltipContent>
                </Tooltip>)}
              </div>
            </TooltipProvider>

            <div className="mt-4">
              <div>Current streak: {userData?.current_streak ?? 0} / {requiredStreak}</div>
              <div>Total streak: {userData?.total_streak ?? 0}</div>
            </div>

            <div className="mt-4">
              <QRButton href={url} disabled={(userData?.current_streak ?? 0) < requiredStreak}>
                Become friends
              </QRButton>
            </div>

          </div>
          <div className="w-[250px] h-[250px] relative bg-accent rounded-md overflow-hidden animate-pulse [&:has(img)]:animate-none">
            <Image
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
              src={`/api/puzzle/${address}`}
              fallback="/ghosts/default.png"
              loading="eager"
              alt="Ghost puzzle"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}