"use client"

import { useMemo } from "react"
import { Area, AreaChart, XAxis } from "recharts"

import { useData } from "@/app/context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { toLocalString } from "@/lib/to-local-string"
import { minBy } from "lodash"
import { useRewardChartData } from "../domain/hooks/use-reward-chart-data"

const rewardChartConfig = {
  rewards: {
    label: "Rewards",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type RewardSeriesPoint = {
  trigger_date: string
  rewards: number
}

type RewardHistoryEvent = {
  trigger_date: string
  locked_reward?: number | string
  liquid_reward?: number | string
  new_user_reward?: number | string
  referral_reward?: number | string
}

interface RewardChartCardProps {
  address: string
}

/**
 * Builds a cumulative reward series with normalized daily points.
 */
function buildRewardSeries(
  rewardEvents: RewardHistoryEvent[],
  decimals: number
): RewardSeriesPoint[] {
  if (!Array.isArray(rewardEvents) || rewardEvents.length === 0) {
    return []
  }

  const sortedEvents = [...rewardEvents].sort((a, b) =>
    a.trigger_date.localeCompare(b.trigger_date)
  )

  const normalizedDailyDeltas = new Map<string, number>()
  const eventDates = new Set<string>()

  for (const event of sortedEvents) {
    const triggerDate = event.trigger_date?.slice(0, 10)
    if (!triggerDate) {
      continue
    }

    eventDates.add(triggerDate)

    const lockedReward = Number(event.locked_reward ?? 0)
    const liquidReward = Number(event.liquid_reward ?? 0)
    const newUserReward = Number(event.new_user_reward ?? 0)
    const referralReward = Number(event.referral_reward ?? 0)

    const totalInBaseUnits =
      lockedReward + liquidReward + newUserReward + referralReward

    const dailyIncrement = totalInBaseUnits / 10 ** Number(decimals)
    if (!Number.isFinite(dailyIncrement) || dailyIncrement === 0) {
      continue
    }

    normalizedDailyDeltas.set(
      triggerDate,
      (normalizedDailyDeltas.get(triggerDate) ?? 0) + dailyIncrement
    )
  }

  const earliestRewardDate =
    [...normalizedDailyDeltas.keys()].sort()[0] ?? [...eventDates].sort()[0]

  if (!earliestRewardDate) {
    return []
  }

  const startDate = new Date(`${earliestRewardDate}T00:00:00Z`)
  const todayUtc = new Date()
  todayUtc.setUTCHours(0, 0, 0, 0)

  const cumulativeSeries: RewardSeriesPoint[] = []
  let cumulativeRewards = 0

  for (
    const cursor = new Date(startDate);
    cursor <= todayUtc;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const cursorKey = cursor.toISOString().slice(0, 10)
    const dailyIncrement = normalizedDailyDeltas.get(cursorKey) ?? 0
    cumulativeRewards += dailyIncrement

    cumulativeSeries.push({
      trigger_date: cursorKey,
      rewards: cumulativeRewards,
    })
  }

  return cumulativeSeries
}

export function RewardChartCard({ address }: RewardChartCardProps) {
  const { data: rewardEvents, isLoading, isError } = useRewardChartData(address)

  const { getFrdToken } = useData()
  const { decimals = 9, symbol = "FRD" } = getFrdToken()

  const rewardSeries = useMemo(
    () => buildRewardSeries(rewardEvents, decimals),
    [rewardEvents, decimals]
  )

  const minimumRewardValue =
    minBy(rewardSeries, (point) => point.rewards)?.rewards ?? 0

  const normalizedRewardSeries = useMemo(() => {
    if (rewardSeries.length === 0) {
      return []
    }

    return rewardSeries.map((point) => ({
      ...point,
      rewards: point.rewards - minimumRewardValue,
    }))
  }, [rewardSeries, minimumRewardValue])

  const shouldShowSkeleton = isLoading || isError

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Total rewards</CardTitle>
      </CardHeader>
      <CardContent>
        {shouldShowSkeleton ? (
          <Skeleton className="aspect-auto h-[230px] w-full" />
        ) : (
          <ChartContainer
            config={rewardChartConfig}
            className="aspect-auto h-[230px] w-full"
          >
            <AreaChart data={normalizedRewardSeries}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1447e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1447e5" stopOpacity={0.1} />
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
                formatter={(value) => `${toLocalString(Number(value) + minimumRewardValue)} ${symbol}`}
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
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
