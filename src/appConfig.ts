export const appConfig = {
  TESTNET: true,
  AA_ADDRESS: "FQQLTDJGGTXKCOHYOR4RZYHN2VE3QZ72",
  ALLOWED_TOKEN_ASSETS: [
    "base", // GBYTE
    "tZgXWTAv+1v1Ow4pMEVFFNlZAobGxMm2kIcr2dVR68c=", // ETH3
    "MWJv6DnI6lSCLa1GrzoSYQYIB7mMZ0tidK/iugz+qAk=", // KUSDC
    "w8tE0UB2Hl/nbTjJkKIiAqGq0QpFQjE8s044QX2MVMo=" // USDC
  ],
  MIN_BALANCE: 1e8, // TODO: 50e9 for mainnet
  MIN_LOCKED_TERM_DAYS: 1, // TODO: 365 for mainnet
  DISCORD_BOT_URL: "obyte:Ama48/uKO+/Tjv28zFKwElBO4SEQNuWAM1VPJkl4DTZO@obyte.org/bb#0000",
  TELEGRAM_BOT_URL: "obyte:A1KwcOAZSWwBnXwa1BKfmhEP2yow1kaUuoi5A6HLOzJZ@obyte.org/bb#0000",
  REAL_NAME_BOT_URL: "obyte:___________@obyte.org/bb#0000",
} as const;