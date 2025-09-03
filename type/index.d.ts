module globalThis {
  // eslint-disable-next-line no-var
  var __OBYTE_CLIENT__: Obyte.Client | undefined;
  // eslint-disable-next-line no-var
  var __OBYTE_HEARTBEAT__: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var 
  var __OBYTE_CONNECTS_TOTAL__: number | undefined;

  var __SYMBOL_STORAGE__: LRUCache<string, TokenMeta> | undefined;
}

type TokenMeta = {
  asset: string; // asset id, "base" for GBYTE
  symbol: string; // e.g. "GBYTE", "USDC"
  decimals: number; // e.g. 9 for GBYTE, 6 for USDC
}