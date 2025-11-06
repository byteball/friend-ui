export const getRequiredStreak = (currentGhostNum: number = 1): number => {
  return ((currentGhostNum ?? 1) + 1) ** 2;
};