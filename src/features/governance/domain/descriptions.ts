export const descriptions: Record<keyof AgentParams, string> = {
  rewards_aa: "The AA that determines the rules for rewards or making friends",
  messaging_attestors: 'Addresses of the attestors who verify user telegram and discord accounts and link them to their Obyte addresses. These links are used to notify users about their rewards',
  real_name_attestors: 'Addresses of the attestors who verify user real names (without disclosing them publicly) to ensure one-man-one-account rule',
  referrer_deposit_reward_share: "____",
  followup_reward_share: "Follow-up reward as a % of the regular reward for becoming friends",
  min_balance_instead_of_real_name: "Minimum balance in FRD (or the equivalent in other assets) to waive the requirement of real-name verification",
}
