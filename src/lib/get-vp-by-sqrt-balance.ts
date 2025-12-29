export const getVPBySqrtBalance = (sqrtFrdBalance: number, decimals: number = 9): number => {
  return sqrtFrdBalance / (10 ** (decimals / 2));
}