import z from "zod";

export const historySchema = z.array(
  z.object({
    address: z.string(),
    trigger_unit: z.string(),

    event: z.enum(['rewards', 'deposit', 'withdrawal', 'replace']),

    total_balance_with_reducers: z.number(),
    total_balance_sans_reducers: z.number(),

    locked_reward: z.number(),
    liquid_reward: z.number(),

    new_user_reward: z.number(),
    referral_reward: z.number(),

    is_stable: z.preprocess((val) => Boolean(val), z.boolean()),

    trigger_date: z.string(),
    creation_date: z.string(),

    total_locked_rewards: z.number(),
    total_liquid_rewards: z.number(),
  }))