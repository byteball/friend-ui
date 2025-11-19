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
import { buildTotalBalanceSeries } from "../domain/build-total-balance-series"
import { useHistoryData } from "../domain/hooks/use-history-data"

const totalBalanceChartConfig = {
  totalBalance: {
    label: "Total balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig


interface TotalBalanceChartCardProps {
  address: string
}

export function TotalBalanceChartCardProps({ address }: TotalBalanceChartCardProps) {
  const { data: rewardEvents, isLoading, isError } = useHistoryData(address)
  const getCookie = useGetCookie();
  const walletAddress = getCookie(WALLET_COOKIE_NAME);

  const { getFrdToken } = useData()
  const { decimals = 9, symbol = "FRD" } = getFrdToken()

  const balanceSeries = useMemo(
    () => buildTotalBalanceSeries(rewardEvents, decimals),
    [rewardEvents, decimals]
  )

  const minimumBalanceValue =
    minBy(balanceSeries, (point) => point.totalBalance)?.totalBalance ?? 0

  const normalizedBalanceSeries = useMemo(() => {
    if (balanceSeries.length === 0) {
      return []
    }

    return balanceSeries.map((point) => ({
      ...point,
      totalBalance: point.totalBalance - minimumBalanceValue,
    }))
  }, [balanceSeries, minimumBalanceValue])

  const shouldShowSkeleton = isLoading || isError

  return (
    <Card className="col-span-6 md:col-span-3">
      <CardHeader>
        <CardTitle>Total balance</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px]">
        {shouldShowSkeleton ? (
          <Skeleton className="aspect-auto h-[260px] w-full" />
        ) : (
          <ChartContainer
            config={totalBalanceChartConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart data={normalizedBalanceSeries}>
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
                minTickGap={1}
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
                formatter={(value) => `${toLocalString(Number(value) + minimumBalanceValue)} ${symbol}`}
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
                dataKey="totalBalance"
                type="linear"
                fill="url(#fillDesktop)" // transparent
                stroke="#1447e5"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>

      {address === walletAddress ? <CardFooterReferral query={`?type=chart`} /> : null}
    </Card>
  )
}
