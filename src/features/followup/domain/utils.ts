import { addDays, format, isAfter, isSameDay, parseISO } from "date-fns";
import { isValidAddress } from "@/lib/is-valid-address";

export function parseAddresses(pair: string): [string, string] | null {
  const parts = pair.split("-");
  if (parts.length !== 2) return null;
  const [addr1, addr2] = parts;
  if (!isValidAddress(addr1) || !isValidAddress(addr2)) return null;
  if (addr1 === addr2) return null;
  return [addr1, addr2];
}

export function getFriendshipKey(state: Record<string, any>, addr1: string, addr2: string): string | null {
  if (state[`friendship_${addr1}_${addr2}`]) return `friendship_${addr1}_${addr2}`;
  if (state[`friendship_${addr2}_${addr1}`]) return `friendship_${addr2}_${addr1}`;
  return null;
}

export const FOLLOWUP_CLAIM_TERM = 10; // days

export const FOLLOWUP_REWARD_DAYS = [60, 150, 270, 450, 720, 1080, 1620] as const;

export type FollowupRewardStatus = 'NOT_STARTED' | 'ACTIVE' | 'EXPIRED' | 'GOT' | 'GOT_ALL';

export function getDaysSinceFriendship(acceptTs: number): number {
  const now = Date.now() / 1000;
  return Math.floor((now - acceptTs) / 86400);
}

export function getFollowupRewardStatus(
  acceptTs: number,
  friendship: Record<string, any> | null
): { status: FollowupRewardStatus; currentMilestone: number | null; daysRemaining: number | null; rewardNumber: number | null } {
  if (!friendship || !acceptTs) {
    return { status: 'NOT_STARTED', currentMilestone: null, daysRemaining: null, rewardNumber: null };
  }

  const daysSinceFriendship = getDaysSinceFriendship(acceptTs);

  const allClaimed = FOLLOWUP_REWARD_DAYS.every(
    (days) => friendship[`followup_${days}`]?.accept_ts
  );

  if (allClaimed) {
    return { status: 'GOT_ALL', currentMilestone: null, daysRemaining: null, rewardNumber: 7 };
  }

  for (let i = 0; i < FOLLOWUP_REWARD_DAYS.length; i++) {
    const days = FOLLOWUP_REWARD_DAYS[i];
    const isClaimed = friendship[`followup_${days}`]?.accept_ts;

    if (isClaimed) continue;

    if (daysSinceFriendship < days) {
      return {
        status: 'NOT_STARTED',
        currentMilestone: days,
        daysRemaining: days - daysSinceFriendship,
        rewardNumber: i + 1,
      };
    }

    if (daysSinceFriendship <= days + FOLLOWUP_CLAIM_TERM) {
      return {
        status: 'ACTIVE',
        currentMilestone: days,
        daysRemaining: days + FOLLOWUP_CLAIM_TERM - daysSinceFriendship,
        rewardNumber: i + 1,
      };
    }

    // Expired, check next milestone
  }

  return { status: 'GOT_ALL', currentMilestone: null, daysRemaining: null, rewardNumber: null };
}

export function getUnlockWarnings(
  userData1: IUserData | undefined,
  userData2: IUserData | undefined,
  username1: string,
  username2: string,
  minLockedTermDays: number,
): string[] {
  const warnings: string[] = [];
  const minUnlockDate = addDays(new Date(), minLockedTermDays);

  if (userData1?.unlock_date) {
    const ud = parseISO(userData1.unlock_date);
    if (!isAfter(ud, minUnlockDate) && !isSameDay(ud, minUnlockDate)) {
      warnings.push(`${username1}'s unlock date is ${format(ud, "MMM d, yyyy")}, must be at least 1 year from now.`);
    }
  } else {
    warnings.push(`${username1} has no locked balance.`);
  }

  if (userData2?.unlock_date) {
    const ud = parseISO(userData2.unlock_date);
    if (!isAfter(ud, minUnlockDate) && !isSameDay(ud, minUnlockDate)) {
      warnings.push(`${username2}'s unlock date is ${format(ud, "MMM d, yyyy")}, must be at least 1 year from now.`);
    }
  } else {
    warnings.push(`${username2} has no locked balance.`);
  }

  return warnings;
}

export interface IFollowupRewards {
  locked: number;
  liquid: number;
}

export async function getFollowupRewards(
  balances: Balances,
  constants: IConstants,
  followupRewardShare: number,
  rewardsConfig: { locked_reward_share: number; liquid_reward_share: number; balance_cap: number },
): Promise<IFollowupRewards> {
  const { getCeilingPrice, getTotalBalance } = await import("@/lib/calculations/get-rewards");
  const { locked_reward_share, liquid_reward_share, balance_cap } = rewardsConfig;
  const ceilingPrice = getCeilingPrice(constants);
  const totalBalance = (await getTotalBalance(balances, ceilingPrice)).with_reducers;
  const capped = Math.min(totalBalance, balance_cap);

  return {
    locked: Math.floor(capped * locked_reward_share * followupRewardShare),
    liquid: Math.floor(capped * liquid_reward_share * followupRewardShare),
  };
}
