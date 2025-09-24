import { columns } from "./columns";
import { LeaderboardTable } from "./leaderboard-table";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const data: UserRank[] = [
  {
    // id: "728ed52f",
    amount: 100,
    friends: 5,
    username: "tonych",
  },
  {
    // id: "728e4f",
    amount: 14,
    friends: 2,
    username: "taumper",
  }
];

export default async function Leaderboard() {

  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Leader board</h1>

    <div className="mt-8">
      <LeaderboardTable data={data} columns={columns} />
    </div>
  </div>
}