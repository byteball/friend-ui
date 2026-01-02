import { LeaderboardTable } from "@/features/leaderboard/leaderboard-table";
import { getProfileUsernames } from "@/lib/get-profile-usernames.server";
import { Metadata } from "next";

import { env } from "@/env";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Obyte Friends — Leaderboard",
  description: "Top performers in Obyte Friends",
  openGraph: {
    images: [
      `/api/og/leaderboard`,
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ObyteOrg',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
}

export default async function Leaderboard() {
  const data = globalThis.__GLOBAL_STORE__?.getLeaderboardData() || [];
  const usernames = await getProfileUsernames(data.map(d => d.address));

  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">Leaderboard</h1>

    <div className="mt-8">
      <LeaderboardTable
        leaderboardData={data}
        usernames={usernames}
      />
    </div>
  </div>
}