"use client"

import { useMemo } from "react"
import { Area, AreaChart, XAxis } from "recharts"

import { useData } from "@/app/context"
import { CardFooterReferral } from "@/components/layouts/card-footer-refferal"
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
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { toLocalString } from "@/lib/to-local-string"
import { minBy } from "lodash"
import { buildRewardSeries } from "../domain/build-reward-series"
import { useRewardChartData } from "../domain/hooks/use-reward-chart-data"

const rewardChartConfig = {
  rewards: {
    label: "Rewards",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig


interface TotalBalanceChartCardProps {
  address: string
}

export function TotalBalanceChartCardProps({ address }: TotalBalanceChartCardProps) {
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
    <Card className="col-span-6 md:col-span-3">
      <CardHeader>
        <CardTitle>Total rewards</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {shouldShowSkeleton ? (
          <Skeleton className="aspect-auto h-[260px] w-full" />
        ) : (
          <ChartContainer
            config={rewardChartConfig}
            className="aspect-auto h-[260px] w-full"
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

      <CardFooterReferral query={`?type=chart&refAddr=${address}`} />
    </Card>
  )
}
