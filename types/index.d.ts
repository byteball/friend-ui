module globalThis {
  // eslint-disable-next-line no-var
  var __OBYTE_CLIENT__: Obyte.Client | undefined;
  // eslint-disable-next-line no-var
  var __OBYTE_HEARTBEAT__: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var 
  var __OBYTE_CONNECTS_TOTAL__: number | undefined;

  var __GLOBAL_STORE__: import('@/GlobalStore').GlobalStore | undefined;
}

type TokenMeta = {
  asset: string; // asset id, "base" for GBYTE
  symbol: string; // e.g. "GBYTE", "USDC"
  decimals: number; // e.g. 9 for GBYTE, 6 for USDC
}

interface IConstants {
  asset: string; // asset id of the AA's main token
  governance_aa: string; // address of the governance AA
  launch_ts: number; // launch timestamp in seconds
}

interface IAaState {
  constants?: IConstants;
  [key: string]: any; // allow additional properties
}


interface IClientSnapshot {
  state: Record<string, any>;
  tokens: Record<string, TokenMeta>;
}

type Balances = Record<string, number>; // asset -> balance

type IUserData = {
  balances: Balances;
  current_ghost_num: number; // current ghost number
  reg_ts: number; // registration timestamp in seconds
  unlock_date: string; // unlock date as a string
  last_date?: string; // last connect date as a string
  liquid_rewards?: number; // liquid rewards amount
  locked_rewards?: number; // locked rewards amount
  total_streak?: number; // total connect streak
  new_user_rewards?: number; // new user rewards amount
  [key: string]: any; // allow additional properties
}

// total_locked_bytes: number; // total locked bytes
// total_locked: number; // total locked amount

interface IReward {
  locked: number;
  liquid: number;
  new_user_reward?: number;
  referred_user_reward?: number;
  is_new?: boolean;
  totalBalance: number;
}

interface IRewards {
  user1: IReward;
  user2: IReward;
  referrers: Record<string, number>; // referrer address -> reward
}

type UserRank = {
  username: string;
  amount: number;
  friends: number;
}