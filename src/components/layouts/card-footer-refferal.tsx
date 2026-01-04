"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, ReactNode, useEffect, useState } from "react";
import { useClipboard } from "use-clipboard-copy";

import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { toLocalString } from "@/lib/to-local-string";
import { CardFooter } from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { TweetCard } from "../ui/tweet-card";

interface CardFooterReferralProps {
  query?: string;
  hasDeposit?: boolean;
  address: string;
  type: "chart" | "streak";
}



export const CardFooterReferral: FC<CardFooterReferralProps> = ({ hasDeposit = false, query = "", type, address }) => {
  const pathname = usePathname();
  const { copied, copy } = useClipboard({
    copiedTimeout: 1000, // timeout duration in milliseconds
  });

  const data = useData();

  const params = data.params;

  const lockedRewardsShareInPercent = toLocalString(appConfig.initialRewardsVariables.locked_reward_share * 100);

  const tweetTextByType: Record<typeof type, ReactNode> = {
    chart: <span>I&apos;m unstoppable, I&apos;m unblockable, I&apos;m uncensorable. Because I keep my money on Obyte. Become my friend and start making {lockedRewardsShareInPercent}% a day by making friends every day – like me.
    </span>,

    streak: <span>Help me continue my streak by becoming my next friend. Similar to me, make {lockedRewardsShareInPercent}% a day by making friends every day.
    </span>
  };

  const { decimals, symbol } = data.getFrdToken();

  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHost(window.location.host);
  }, []);

  const cleanedPathname = pathname?.replaceAll("chart", "").replace("streak", "");

  const referralUrl = host && pathname
    ? `https://${host + cleanedPathname + (cleanedPathname.endsWith("/") ? type : `/${type}`)}${query}`
    : "";
  const canShare = Boolean(referralUrl);

  return <>
    <Separator />

    {canShare ? <CardFooter className="items-end justify-end">
      <FieldGroup>
        {hasDeposit ? <Field>
          <FieldLabel>Share this link to get new friends and referrals</FieldLabel>
          <InputGroup>
            <InputGroupInput value={referralUrl} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => {
                  if (!canShare) {
                    return;
                  }

                  copy(referralUrl);
                }}
                disabled={!canShare}
              >
                {copied ? <CheckIcon className="stroke-green-700" size={6} /> : <CopyIcon size={6} />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <small className="text-sm text-muted-foreground">You&apos;ll receive {toLocalString(params.referrer_frd_deposit_reward_share * 100)}% of their deposits in {symbol}, {toLocalString(params.referrer_bytes_deposit_reward_share * 100)}% of their deposits in GBYTE, {toLocalString(params.referrer_deposit_asset_deposit_reward_share * 100)}% of all other deposits, and a {appConfig.initialRewardsVariables.new_user_reward / 10 ** decimals} {symbol} (&asymp; ${toLocalString(((appConfig.initialRewardsVariables.new_user_reward / 10 ** decimals) * data.getFrdPrice()).toPrecision(3))}) reward when they make their first friend
          </small>
          <div className="pt-2 mt-2">
            <FieldLabel>Example tweet</FieldLabel>
            <TweetCard
              username="friendOfObyte"
              displayName="Friend"
              timeAgo="Just now"
              avatarUrl="/logo.svg"
              ogTitle="Obyte Friends"
              ogImageUrl={`/api/og/${type === "streak" ? "puzzle" : type}/${address}?t=${Math.floor(Date.now() / (60 * 1000))}`}
              tweetText={tweetTextByType[type]}
            />
          </div>
        </Field> : <Field>
          <FieldLabel className="text-yellow-600">To be able to find new friends and referrals, make a deposit</FieldLabel>
        </Field>}
      </FieldGroup>
    </CardFooter> : <CardFooter>
      <FieldGroup>
        <Field>
          <FieldLabel>
            <Skeleton className="h-[19.5px] w-full" />
          </FieldLabel>
          <Skeleton className="w-full h-9" />
        </Field>
      </FieldGroup>
    </CardFooter>}
  </>
}