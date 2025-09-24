import { columns } from "./columns";
import { LeaderboardTable } from "./leaderboard-table";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Leaderboard() {
  const data = globalThis.__GLOBAL_STORE__?.getLeaderboardData() || [];
  const tokens = globalThis.__GLOBAL_STORE__?.getTokens() || {};
  const constants = globalThis.__GLOBAL_STORE__?.getState().constants as IConstants;
  const asset = constants?.asset || 'base';
  const frdToken = tokens[asset];

  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Leader board</h1>

    <div className="mt-8">
      <LeaderboardTable
        data={data}
        decimals={frdToken.decimals}
        symbols={frdToken.symbol}
        columns={columns}
      />
    </div>
  </div>
}