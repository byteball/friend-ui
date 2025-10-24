import { LeaderboardTable } from "@/features/leaderboard/leaderboard-table";
import { getProfileUsernames } from "@/lib/get-profile-usernames.server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Leaderboard() {
  const data = globalThis.__GLOBAL_STORE__?.getLeaderboardData() || [];
  const usernames = await getProfileUsernames(data.map(d => d.address));

  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Leader board</h1>

    <div className="mt-8">
      <LeaderboardTable
        leaderboardData={data}
        usernames={usernames}
      />
    </div>
  </div>
}