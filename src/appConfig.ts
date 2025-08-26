export const appConfig = {
  TESTNET: true,
  AA_ADDRESS: "", // TODO: Add AA address
  ALLOWED_TOKEN_ASSETS: [
    "base", // GBYTE
    "tZgXWTAv+1v1Ow4pMEVFFNlZAobGxMm2kIcr2dVR68c=", // ETH3
    "MWJv6DnI6lSCLa1GrzoSYQYIB7mMZ0tidK/iugz+qAk=", // KUSDC
    "w8tE0UB2Hl/nbTjJkKIiAqGq0QpFQjE8s044QX2MVMo=" // USDC
  ],
  MIN_BALANCE: 1e8, // TODO: 500e9 for mainnet
  MIN_LOCKED_TERM_DAYS: 1, // TODO: 365 for mainnet
} as const;