export const getVPByBalance = (balance: Balances = {}, ceilingPrice: number = 1, decimals: number = 9): number => {
  const balanceInFrd = (balance.frd ?? 0) + ((balance.base ?? 0) / ceilingPrice);

  return Math.sqrt(balanceInFrd / 10 ** decimals);
}
