export const BOUNCE_FEES = 1e4;

export const WALLET_COOKIE_NAME = 'friend.wallet';
export const WALLET_COOKIE_EXPIRES = 60 * 60 * 24 * 28; // 28 days

export const GBYTE_TOKEN_META: TokenMeta = {
  asset: "base",
  symbol: "GBYTE",
  decimals: 9,
};

export const STORE_EVENTS = {
  SNAPSHOT: "SNAPSHOT",
  STATE_UPDATE: "STATE_UPDATE",
} as const;

export type STORE_EVENTS = typeof STORE_EVENTS[keyof typeof STORE_EVENTS];