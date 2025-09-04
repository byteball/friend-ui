module globalThis {
  // eslint-disable-next-line no-var
  var __OBYTE_CLIENT__: Obyte.Client | undefined;
  // eslint-disable-next-line no-var
  var __OBYTE_HEARTBEAT__: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var 
  var __OBYTE_CONNECTS_TOTAL__: number | undefined;

  var __SYMBOL_STORAGE__: LRUCache<string, TokenMeta> | undefined;

  var __STATE_VARS_STORAGE__: LRUCache<string, any> | undefined;
}

type TokenMeta = {
  asset: string; // asset id, "base" for GBYTE
  symbol: string; // e.g. "GBYTE", "USDC"
  decimals: number; // e.g. 9 for GBYTE, 6 for USDC
}

interface IClientData {
  state: Record<string, any>;
  symbols: Record<string, TokenMeta>;
}

type IUserData = {
  balances: Record<string, number>; // asset -> balance
  current_ghost_num: number; // current ghost number
  reg_ts: number; // registration timestamp in seconds
  unlock_date: string; // unlock date as a string
  [key: string]: any; // allow additional properties
}

// total_locked_bytes: number; // total locked bytes
// total_locked: number; // total locked amount