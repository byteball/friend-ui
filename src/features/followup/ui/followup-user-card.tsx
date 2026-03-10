import "server-only";

import { FC } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChainedAvatar } from "@/components/layouts/chained-avatar";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { getContactUrlByUsername } from "@/lib/get-contact-url-by-username";
import { toLocalString } from "@/lib/to-local-string";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FollowupUserCardProps {
  address: string;
  userData: IUserData | undefined;
  rewards: { locked: number; liquid: number } | null;
  frdDecimals: number;
  frdSymbol: string;
}

export const FollowupUserCard: FC<FollowupUserCardProps> = async ({
  address,
  userData,
  rewards,
  frdDecimals,
  frdSymbol,
}) => {
  const store = globalThis.__GLOBAL_STORE__;
  const username = await getProfileUsername(address) ?? address.slice(0, 6) + "..." + address.slice(-4);

  const tgAttestation = await store?.getTgAttestation(address);
  const discordAttestation = await store?.getDiscordAttestation(address);

  const tgUsername = tgAttestation?.username;
  const tgUrl = getContactUrlByUsername(tgUsername, "telegram", tgAttestation?.userId);

  const discordUsername = discordAttestation?.username;
  const discordUrl = getContactUrlByUsername(discordUsername, "discord", discordAttestation?.userId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ChainedAvatar
            className="size-12"
            tgUsername={tgAttestation?.username}
            tgUserId={tgAttestation?.userId}
            discordUserId={discordAttestation?.userId}
            fallbackText={username.slice(0, 2).toUpperCase()}
          />
          <CardTitle>
            <Link href={`/${address}`} className="hover:underline first-letter:uppercase">
              {username}
            </Link>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex space-x-4 flex-wrap gap-y-2">
          {tgUsername && (
            <div className="flex gap-x-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <svg width={20} height={20} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
                    </svg>
                  </TooltipTrigger>
                  <TooltipContent>Telegram</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div>{tgUrl ? <a href={tgUrl} target="_blank" rel="noopener nofollow">{tgUsername}</a> : tgUsername}</div>
            </div>
          )}

          {discordUsername && (
            <div className="flex gap-x-2 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <svg width={20} height={20} viewBox="0 0 24 24" className="text-muted-foreground">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M14.983 3l.123 .006c2.014 .214 3.527 .672 4.966 1.673a1 1 0 0 1 .371 .488c1.876 5.315 2.373 9.987 1.451 12.28c-1.003 2.005 -2.606 3.553 -4.394 3.553c-.732 0 -1.693 -.968 -2.328 -2.045a21.512 21.512 0 0 0 2.103 -.493a1 1 0 1 0 -.55 -1.924c-3.32 .95 -6.13 .95 -9.45 0a1 1 0 0 0 -.55 1.924c.717 .204 1.416 .37 2.103 .494c-.635 1.075 -1.596 2.044 -2.328 2.044c-1.788 0 -3.391 -1.548 -4.428 -3.629c-.888 -2.217 -.39 -6.89 1.485 -12.204a1 1 0 0 1 .371 -.488c1.439 -1.001 2.952 -1.459 4.966 -1.673a1 1 0 0 1 .935 .435l.063 .107l.651 1.285l.137 -.016a12.97 12.97 0 0 1 2.643 0l.134 .016l.65 -1.284a1 1 0 0 1 .754 -.54l.122 -.009zm-5.983 7a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15zm6 0a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" strokeWidth="0" fill="currentColor" />
                    </svg>
                  </TooltipTrigger>
                  <TooltipContent>Discord</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div>{discordUrl ? <a href={discordUrl} target="_blank" rel="noopener nofollow">{discordUsername}</a> : discordUsername}</div>
            </div>
          )}
        </div>

        {rewards && (
          <div className="text-sm text-muted-foreground">
            <div>Locked reward: <span className="text-foreground font-medium">{toLocalString(rewards.locked / 10 ** frdDecimals)} {frdSymbol}</span></div>
            <div>Liquid reward: <span className="text-foreground font-medium">{toLocalString(rewards.liquid / 10 ** frdDecimals)} {frdSymbol}</span></div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
