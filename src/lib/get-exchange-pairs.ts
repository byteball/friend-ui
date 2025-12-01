export const getExchangePairs = (tokens: TokenMeta[], frdAsset: string): Record<string, TokenMeta[]> => {
  const pairs: Record<string, TokenMeta[]> = {};
  const frdTokenMeta = tokens.find((token) => token.asset === frdAsset);

  if (!frdTokenMeta) {
    throw new Error("FRD token metadata not found");
  }

  const tokensExcludingFrd = tokens.filter((t) => t.asset !== frdAsset);

  // Pairs for frd asset: frd can be exchanged with any other token
  pairs[frdAsset] = tokensExcludingFrd;

  // Pairs for every other asset: each can be exchanged only with frd token
  // for (const token of tokensExcludingFrd) {
  //   pairs[token.asset] = [
  //     {
  //       asset: frdAsset,
  //       symbol: frdTokenMeta.symbol,
  //       decimals: frdTokenMeta.decimals,
  //     },
  //   ];
  // }


  return pairs;
}