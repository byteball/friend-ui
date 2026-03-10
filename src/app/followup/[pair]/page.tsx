import "server-only";

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { appConfig } from "@/app-config";
import { env } from "@/env";
import { getProfileUsername } from "@/lib/get-profile-username.server";
import { formatDateAsUTC } from "@/lib/format-date-as-utc";

import { FollowupUserCard } from "@/features/followup/ui/followup-user-card";
import { FollowupClaimButton } from "@/features/followup/ui/followup-claim-button";
import { FollowupStatusMessage } from "@/features/followup/ui/followup-status-message";
import { FollowupTimeline } from "@/features/followup/ui/followup-timeline";
import {
  getFollowupRewardStatus,
  getDaysSinceFriendship,
  getUnlockWarnings,
  getFriendshipKey,
  getFollowupRewards,
  parseAddresses,
} from "@/features/followup/domain/utils";

import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ pair: string }> }
): Promise<Metadata> {
  const { pair } = await params;
  const addresses = parseAddresses(pair);

  if (!addresses) {
    return {
      title: "Obyte Friends - Follow-up Rewards",
      robots: { index: false, follow: false },
    };
  }

  const [addr1, addr2] = addresses;
  const username1 = await getProfileUsername(addr1) || addr1.slice(0, 6) + "...";
  const username2 = await getProfileUsername(addr2) || addr2.slice(0, 6) + "...";

  return {
    title: `Follow-up Rewards — ${username1} & ${username2}`,
    description: `Follow-up rewards between ${username1} and ${username2} on Obyte Friends`,
    robots: { index: true, follow: true },
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  };
}

export default async function FollowupPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const addresses = parseAddresses(pair);

  if (!addresses) return notFound();

  const [addr1, addr2] = addresses;
  const state = globalThis.__GLOBAL_STORE__?.getState() ?? {};
  const friendshipKey = getFriendshipKey(state, addr1, addr2);

  if (!friendshipKey) {
    return (
      <div className="grid gap-5 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Follow-up Rewards</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              These users are not friends.{" "}
              <Link href={`/${addr1}`} className="underline">
                {addr1.slice(0, 6)}...{addr1.slice(-4)}
              </Link>{" "}
              and{" "}
              <Link href={`/${addr2}`} className="underline">
                {addr2.slice(0, 6)}...{addr2.slice(-4)}
              </Link>{" "}
              haven&apos;t connected yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const friendship = state[friendshipKey];
  const acceptTs = friendship?.initial?.accept_ts;

  if (!acceptTs) {
    return (
      <div className="grid gap-5 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Follow-up Rewards</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              This friendship hasn&apos;t been fully accepted yet. Both friends need to claim their initial reward first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysSinceFriendship = getDaysSinceFriendship(acceptTs);
  const { status, currentMilestone, daysRemaining, rewardNumber } = getFollowupRewardStatus(acceptTs, friendship);

  const userData1: IUserData | undefined = state[`user_${addr1}`];
  const userData2: IUserData | undefined = state[`user_${addr2}`];

  const frdTokenMeta = globalThis.__GLOBAL_STORE__?.getOwnToken();
  const frdDecimals = frdTokenMeta?.decimals ?? 9;
  const frdSymbol = frdTokenMeta?.symbol ?? "FRD";

  // Calculate estimated follow-up rewards
  const constants = state.constants as IConstants | undefined;
  const followupRewardShare = friendship.followup_reward_share
    ?? (state.variables as AgentParams | undefined)?.followup_reward_share
    ?? appConfig.initialParamsVariables.followup_reward_share;
  const rewardsConfig = appConfig.initialRewardsVariables;

  // AA skips balance_cap when one user's first friend is the other (or either is new)
  const bNewUser = !userData1?.last_date || !userData2?.last_date;
  const skipCap = bNewUser || userData1?.first_friend === addr2 || userData2?.first_friend === addr1;

  const [rewards1, rewards2] = constants
    ? await Promise.all([
        getFollowupRewards(userData1?.balances, constants, followupRewardShare, rewardsConfig, skipCap),
        getFollowupRewards(userData2?.balances, constants, followupRewardShare, rewardsConfig, skipCap),
      ])
    : [null, null];

  // Check unlock dates
  const username1 = await getProfileUsername(addr1) ?? addr1.slice(0, 6) + "..." + addr1.slice(-4);
  const username2 = await getProfileUsername(addr2) ?? addr2.slice(0, 6) + "..." + addr2.slice(-4);
  const unlockWarnings = getUnlockWarnings(userData1, userData2, username1, username2, appConfig.MIN_LOCKED_TERM_DAYS);
  const hasUnlockWarnings = unlockWarnings.length > 0;

  const friendshipDate = new Date(acceptTs * 1000);

  return (
    <div className="grid gap-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Follow-up Rewards</h1>
        <p className="text-muted-foreground mt-1">
          Friends since {formatDateAsUTC(friendshipDate)} ({daysSinceFriendship} days)
        </p>
      </div>

      <FollowupStatusMessage
        status={status}
        rewardNumber={rewardNumber}
        daysRemaining={daysRemaining}
        currentMilestone={currentMilestone}
        daysSinceFriendship={daysSinceFriendship}
        unlockWarnings={hasUnlockWarnings ? unlockWarnings : null}
      >
        {status === "ACTIVE" && (
          <FollowupClaimButton
            addr1={addr1}
            addr2={addr2}
            days={currentMilestone!}
            disabled={hasUnlockWarnings}
          />
        )}
      </FollowupStatusMessage>

      <div className="grid gap-5 sm:grid-cols-2">
        <FollowupUserCard
          address={addr1}
          userData={userData1}
          rewards={rewards1}
          frdDecimals={frdDecimals}
          frdSymbol={frdSymbol}
        />
        <FollowupUserCard
          address={addr2}
          userData={userData2}
          rewards={rewards2}
          frdDecimals={frdDecimals}
          frdSymbol={frdSymbol}
        />
      </div>

      <FollowupTimeline
        daysSinceFriendship={daysSinceFriendship}
        friendship={friendship}
      />
    </div>
  );
}
