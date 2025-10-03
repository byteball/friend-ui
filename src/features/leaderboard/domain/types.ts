
export type Username = { address: string; username: string | null };

export interface DataTableProps<TData> {
  leaderboardData: TData[];
  usernames: Username[];
}

export interface ILeaderboardTableMeta {
  frdDecimals: number;
  frdSymbol: string;
  usernames: Username[];
}
