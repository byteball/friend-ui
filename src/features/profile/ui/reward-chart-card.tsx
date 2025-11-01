"use client"

import { Area, AreaChart, XAxis } from "recharts"

import { useData } from "@/app/context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useRewardChartData } from "../domain/hooks/use-reward-chart-data"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig


interface RewardChartCardProps {
  address: string;
}

export function RewardChartCard({ address }: RewardChartCardProps) {
  const { data, isLoading, isError } = useRewardChartData(address);

  const { getFrdToken } = useData();
  const { decimals = 9, symbol = "FRD" } = getFrdToken();

  // Assumes: `data` is the array from your example, `decimals` is a number
  const filteredData = (() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // 1) Sort events by trigger_date asc (string like "YYYY-MM-DD HH:mm:ss")
    const sorted = [...data].sort((a, b) =>
      a.trigger_date.localeCompare(b.trigger_date)
    );

    // 2) Aggregate daily increments (sum of event-level rewards per day)
    //    We'll divide by 10**decimals to get human-readable units.
    const dayIncrements = new Map<string, number>();

    for (const item of sorted) {
      // Normalize to YYYY-MM-DD
      const date = item.trigger_date.slice(0, 10);

      // Per-event increment (not totals!)
      const incRaw =
        (Number(item.locked_reward || 0) +
          Number(item.liquid_reward || 0) +
          Number(item.new_user_reward || 0) +
          Number(item.referral_reward || 0)) /
        (10 ** Number(decimals || 0));

      if (!Number.isFinite(incRaw) || incRaw === 0) {
        // Ignore non-finite and zero increments; deposits will be 0 anyway
        continue;
      }

      dayIncrements.set(date, (dayIncrements.get(date) ?? 0) + incRaw);
    }

    // If there are no reward increments at all, still return a flat series from first date?
    // Choose first date from either events or from dayIncrements keys.
    const allDates = new Set<string>(sorted.map(e => e.trigger_date.slice(0, 10)));
    const firstDateStr =
      [...dayIncrements.keys()].sort()[0] ??
      [...allDates].sort()[0];

    if (!firstDateStr) return [];

    // 3) Build continuous daily series from first date to today (UTC midnight)
    const firstDate = new Date(`${firstDateStr}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result: { trigger_date: string; rewards: number }[] = [];

    // Start from 0 and accumulate daily increments
    let cumulative = 0;

    // If you want the first day to start at 0 and then show 0 on days
    // without increments until a reward arrives, leave as is.
    for (let d = new Date(firstDate); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const inc = dayIncrements.get(dateStr) ?? 0;
      cumulative += inc;

      result.push({
        trigger_date: dateStr,
        rewards: cumulative,
      });
    }

    return result;
  })();

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Total rewards</CardTitle>
      </CardHeader>
      <CardContent>
        {(isLoading || isError) ? <Skeleton className="aspect-auto h-[220px] w-full" /> : <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#1447e5"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#1447e5"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="trigger_date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              formatter={(v) => `${v} ${symbol}`}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {

                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="rewards"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="#1447e5"
              stackId="a"

            />
          </AreaChart>
        </ChartContainer>}
      </CardContent>
    </Card>
  )
}
