import { UTCDate } from "@date-fns/utc";
import { parseISO } from "date-fns";

interface IFriendData {
  address: string;
  date: number;
  rewards: IFriendRewards;
  referrerReward: number;
}

export interface IFriendRewards {
  liquid: number;
  locked: number;
  new_user_reward: number;
}

export const getFriendList = (state: IAaState, address: string): IFriendData[] => {

  return Object.entries(state)
    .filter(([key]) => key.startsWith(`friend_${address}_`))
    .map(([key, value]) => {
      const [_, _adr, dateString] = key.split('_');
      const date = new UTCDate(parseISO(dateString));
      let currentAddressIsA: boolean = true;

      if (state[`friendship_${address}_${value}`]) {
        currentAddressIsA = true;
      } else if (state[`friendship_${value}_${address}`]) {
        currentAddressIsA = false;
      }

      const friendship = currentAddressIsA
        ? state[`friendship_${address}_${value}`]
        : state[`friendship_${value}_${address}`];

      const referrers = friendship?.initial?.rewards?.referrers || {};

      let rewards: IFriendRewards = {
        liquid: 0,
        locked: 0,
        new_user_reward: 0,
      }

      if (friendship) {
        const initialRewards = friendship?.initial?.rewards[currentAddressIsA ? "a" : "b"];
        if (initialRewards) {
          rewards = initialRewards;
        }
      }

      return ({
        address: value,
        date: date.getTime() / 1000,
        rewards,
        referrerReward: address in referrers ? referrers[address] : 0
      });
    })
}