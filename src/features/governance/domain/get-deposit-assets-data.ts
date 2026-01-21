
export type DepositAssetVote = {
  voter_address: string;
  address: string;
  sqrt_amount: number;
}

interface IDepositAssetData {
  leader?: string;
  challengingPeriodStartTs?: number;
  votes: DepositAssetVote[];
  support: Record<string, number>;
  asset: string;
}

type getDepositAssetsDataResult = Record<string, IDepositAssetData>;

export const getDepositAssetsData = (state: IAaState): getDepositAssetsDataResult => {
  const result: Record<string, IDepositAssetData> = {};

  Object.entries(state).forEach(([key, value]) => {
    if (key.startsWith('challenging_period_start_ts_deposit_asset_')) {
      const asset = key.replace("challenging_period_start_ts_deposit_asset_", "");

      if (!result[asset]) result[asset] = { asset, votes: [], support: {} };

      result[asset].challengingPeriodStartTs = value;
    }

    else if (key.startsWith('choice_') && key.includes('_deposit_asset_') && typeof value === 'string') {
      const [voter_address, asset] = key.replace("choice_", "").split("_deposit_asset_");

      if (!result[asset]) result[asset] = { asset, votes: [], support: {} };

      result[asset].votes = [
        ...result[asset].votes || [],
        {
          voter_address,
          address: value,
          sqrt_amount: state[`votes_${voter_address}`]?.[`deposit_asset_${asset}`]?.sqrt_balance || 0
        }
      ];
    } else if (key.startsWith('leader_deposit_asset_')) {
      const asset = key.replace("leader_deposit_asset_", "");

      if (!result[asset]) result[asset] = { asset, votes: [], support: {} };
      result[asset].leader = value;
    } else if (key.startsWith('support_deposit_asset_')) {
      const rest = key.replace("support_deposit_asset_", "");
      const lastUnderscoreIndex = rest.lastIndexOf("_");

      if (lastUnderscoreIndex === -1) return;

      const asset = rest.slice(0, lastUnderscoreIndex);
      const address = rest.slice(lastUnderscoreIndex + 1);

      if (!result[asset]) result[asset] = { asset, votes: [], support: {} };
      result[asset].support[address] = value as number;
    };
  });

  return result;
};