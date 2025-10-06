import { DepositAssetVote } from "./get-deposit-assets-data";

export interface IAggregatedData {
  address: string;
  sqrt_amount: number;
  voters: string[];
}

export const getAggregatedVotes = (votes: DepositAssetVote[]) => {
  const aggregated: Record<string, IAggregatedData> = {};

  votes.forEach((vote) => {
    if (vote.address in aggregated) {
      aggregated[vote.address].sqrt_amount += vote.sqrt_amount;
      aggregated[vote.address].voters.push(vote.voter_address);
    } else {
      const { address, voter_address, sqrt_amount } = vote;
      aggregated[vote.address] = { address, sqrt_amount, voters: [voter_address] };
    }
  });

  return Object.values(aggregated);
}