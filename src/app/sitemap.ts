import type { MetadataRoute } from "next";
import "server-only";

import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/leaderboard`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/governance`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const leaderboardData = globalThis.__GLOBAL_STORE__?.getLeaderboardData() ?? [];

  const userPages: MetadataRoute.Sitemap = leaderboardData.map((entry) => ({
    url: `${baseUrl}/${entry.address}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...userPages];
}
