import { env } from "./env";

export const appConfig = {
  TESTNET: env.NEXT_PUBLIC_TESTNET,
  AA_ADDRESS: env.NEXT_PUBLIC_AA_ADDRESS,
  NOTIFY_URL: env.NEXT_PUBLIC_NOTIFY_URL,
  NOTIFY_PAIRING_URL: env.NEXT_PUBLIC_NOTIFY_PAIRING_URL,
  TOKEN_REGISTRY_AA: "O6H6ZIFI57X3PLTYHOCVYPP5A553CYFQ",
  MIN_LOCKED_TERM_DAYS: env.NEXT_PUBLIC_TESTNET ? 1 : 365,
  CHALLENGING_PERIOD: env.NEXT_PUBLIC_TESTNET ? 3600 : 3 * 86400, // in seconds
  DISCORD_BOT_URL: "obyte:Ama48/uKO+/Tjv28zFKwElBO4SEQNuWAM1VPJkl4DTZO@obyte.org/bb#0000",
  TELEGRAM_BOT_URL: "obyte:A1KwcOAZSWwBnXwa1BKfmhEP2yow1kaUuoi5A6HLOzJZ@obyte.org/bb#0000",
  REAL_NAME_BOT_URL: "obyte:AsYnI7C8WuXqb2aLMSr0nfpLC+u3FRSLWwkp1e9ib15Z@obyte.org/bb#0000",

  NEXT_PUBLIC_CITY_AA_ADDRESS: "CITYC3WWO5DD2UM6HQR3H333RRTD253Q",
  NEXT_PUBLIC_DISCORD_ATTESTOR: "5KM36CFPBD2QJLVD65PHZG34WEM4RPY2",
  NEXT_PUBLIC_TELEGRAM_ATTESTOR: "JBW7HT5CRBSF7J7RD26AYLQG6GZDPFPS",

  initialParamsVariables: {
    rewards_aa: 'TU54DXPXLYIMRMKYURIIEYHVMBDBKOCD',
    messaging_attestors: 'JBW7HT5CRBSF7J7RD26AYLQG6GZDPFPS:5KM36CFPBD2QJLVD65PHZG34WEM4RPY2',
    real_name_attestors: 'JFKWGRMXP3KHUAFMF4SJZVDXFL6ACC6P',
    referrer_frd_deposit_reward_share: 0.02,
    referrer_bytes_deposit_reward_share: 0.01,
    referrer_deposit_asset_deposit_reward_share: 0.01,
    followup_reward_share: 0.1,
    min_balance_instead_of_real_name: 50e9
  } as AgentParams,

  initialRewardsVariables: { // variables from rewards AA
    locked_reward_share: 0.01,
    liquid_reward_share: 0.001,

    deposit_asset_reducer: 0.5,
    bytes_reducer: 0.75,

    new_user_reward: 10e9,
    referral_reward: 10e9,

    balance_cap: 200e9,
  }
} as const;