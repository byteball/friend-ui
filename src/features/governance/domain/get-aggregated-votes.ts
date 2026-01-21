import { DepositAssetVote } from "./get-deposit-assets-data";

export interface IAggregatedData {
  address: string;
  total_sqrt_support_amount: number;
  votes: DepositAssetVote[];
}

export const getAggregatedVotes = (votes: DepositAssetVote[], supportedValues?: Record<string, number>) => {
  const aggregated: Record<string, IAggregatedData> = {};

  Object.keys(supportedValues || {}).forEach(address => {
    aggregated[address] = {
      address,
      total_sqrt_support_amount: supportedValues![address],
      votes: votes.filter(vote => vote.address === address)
    };
  });

  return Object.values(aggregated);
}