import { appConfig } from "@/appConfig";
import { YEAR } from "@/constants";
import { getUnixTime } from "date-fns";
import httpClient from "../httpClient";

const locked_reward_share = 0.01;
const liquid_reward_share = 0.001;

const deposit_asset_reducer = 0.5;
const bytes_reducer = 0.75;

const new_user_reward = 10e9;
const referral_reward = 10e9;

const balance_cap = 200e9;

const getCeilingPrice = (aaConstants: IConstants) => {
  const now = getUnixTime(new Date());

  return 2 ** ((now - aaConstants.launch_ts) / YEAR);
}


const getDepositAssetExchangeRate = async (asset: string): Promise<number> => {
  return httpClient.executeGetter(appConfig.AA_ADDRESS, 'get_deposit_asset_exchange_rate', [appConfig.AA_ADDRESS, asset])
}

// 57 str
const getTotalBalance = async (balances: Balances, ceilingPrice: number) => {
  const totals = { in_bytes: (balances.base ?? 0) * bytes_reducer };

  for (const [asset, balance] of Object.entries(balances)) {
    if (asset === 'base' || asset === 'frd') continue;

    const exchangeRate = await getDepositAssetExchangeRate(asset);

    totals.in_bytes = totals.in_bytes + balance * exchangeRate * deposit_asset_reducer;
  }

  return (balances.frd ?? 0) + (totals.in_bytes / ceilingPrice);
}

export const getRewards = async (user1: IUserData, user2: IUserData, constants: IConstants) => {
  const ceilingPrice = getCeilingPrice(constants);
  const totalBalance1 = await getTotalBalance(user1?.balances ?? {}, ceilingPrice);
  const totalBalance2 = await getTotalBalance(user2?.balances ?? {}, ceilingPrice);

  const bNewUser = !user1?.last_date || !user2?.last_date;

  const cappedTotalBalance1 = bNewUser ? totalBalance1 : Math.min(totalBalance1, balance_cap);
  const cappedTotalBalance2 = bNewUser ? totalBalance2 : Math.min(totalBalance2, balance_cap);

  console.log('totalBalance1', totalBalance1 / 10 ** 9, 'cappedTotalBalance1', (cappedTotalBalance1 * locked_reward_share) / 10 ** 9);
  const rewards: IRewards = {
    user1: {
      locked: Math.floor(cappedTotalBalance1 * locked_reward_share),
      liquid: Math.floor(cappedTotalBalance1 * liquid_reward_share),
      totalBalance: cappedTotalBalance1
    },
    user2: {
      locked: Math.floor(cappedTotalBalance2 * locked_reward_share),
      liquid: Math.floor(cappedTotalBalance2 * liquid_reward_share),
      totalBalance: cappedTotalBalance2
    },
    referrers: {} as Record<string, number> // referrer address -> reward
  };

  if (!user1?.last_date)
    rewards.user1.is_new = true;
  if (!user2?.last_date)
    rewards.user2.is_new = true;


  if (bNewUser) {
    const cappedNewUserReward = Math.floor(Math.min(new_user_reward, totalBalance1, totalBalance2));

    rewards.user1.locked = rewards.user1.locked + cappedNewUserReward;
    rewards.user1.new_user_reward = cappedNewUserReward;

    rewards.user2.locked = rewards.user2.locked + cappedNewUserReward;
    rewards.user2.new_user_reward = cappedNewUserReward;
  }

  // referrers
  if (!user1?.last_date && user1?.ref) {
    const cappedReferralReward1 = Math.min(referral_reward, Math.floor(totalBalance1));
    rewards.user1.referred_user_reward = cappedReferralReward1;
    rewards.user1.locked = rewards.user1.locked + cappedReferralReward1;

    rewards.referrers[user1.ref] = cappedReferralReward1;
  }

  if (!user2?.last_date && user2?.ref) {
    const cappedReferralReward2 = Math.min(referral_reward, Math.floor(totalBalance2));
    rewards.user2.referred_user_reward = cappedReferralReward2;
    rewards.user2.locked = rewards.user2.locked + cappedReferralReward2;

    rewards.referrers[user2.ref] = cappedReferralReward2 + rewards.referrers[user2.ref]; // might be the same referrer for both users
  }

  return rewards;
}