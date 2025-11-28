"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { WALLET_COOKIE_NAME } from "@/constants"
import { toLocalString } from "@/lib/to-local-string"
import cn from "classnames"
import { useGetCookie } from "cookies-next"
import { minBy } from "lodash"
import { buildTotalBalanceSeries } from "../domain/build-total-balance-series"
import { useHistoryData } from "../domain/hooks/use-history-data"

const totalBalanceChartConfig = {
  totalBalance: {
    label: "Locked balance",
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

  const maximumBalanceValue = useMemo(() => {
    if (!balanceSeries.length) return minimumBalanceValue
    let max = balanceSeries[0].totalBalance
    for (let i = 1; i < balanceSeries.length; i++) {
      if (balanceSeries[i].totalBalance > max) max = balanceSeries[i].totalBalance
    }
    // Fallback when all values are equal to avoid zero-height domain in Recharts
    if (max === minimumBalanceValue) {
      const pad = max === 0 ? 1 : Math.abs(max) * 0.1
      return max + pad
    }
    return max
  }, [balanceSeries, minimumBalanceValue])

  const domainMinValue = useMemo(() => {
    if (!balanceSeries.length) return minimumBalanceValue
    const firstNonZeroIdx = balanceSeries.findIndex(p => p.totalBalance > 0)
    if (firstNonZeroIdx === -1) return minimumBalanceValue
    let min = balanceSeries[firstNonZeroIdx].totalBalance
    for (let i = firstNonZeroIdx + 1; i < balanceSeries.length; i++) {
      if (balanceSeries[i].totalBalance < min) min = balanceSeries[i].totalBalance
    }
    return min
  }, [balanceSeries, minimumBalanceValue])

  const shouldShowSkeleton = isLoading || isError

  return (
    <Card className="col-span-6 md:col-span-3">
      <CardHeader>
        <CardTitle>Locked balance</CardTitle>
      </CardHeader>
      <CardContent className={cn({ "min-h-[300px]": address === walletAddress, "min-h-60": address !== walletAddress })}>
        {shouldShowSkeleton ? (
          <Skeleton className="aspect-auto h-[260px] w-full" />
        ) : (
          <ChartContainer
            config={totalBalanceChartConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={balanceSeries}
            >
              <XAxis
                dataKey="trigger_date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={18}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />

              <CartesianGrid vertical={false} />

              <ChartTooltip
                cursor={false}
                formatter={(value) => `${toLocalString(Number(value))} ${symbol}`}
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
                type="monotone"
                fill="url(#fillDesktop)"
                baseValue="dataMin"
                stroke="#1447e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />

              <YAxis
                tickFormatter={(v) => `${toLocalString(Number(v).toPrecision(3))}`}
                tickLine={false}
                axisLine={false}
                domain={[domainMinValue, maximumBalanceValue]}
                tickMargin={8}
                type="number"
                tickCount={4}
                width={50}
              />

            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>

      {address === walletAddress ? <CardFooterReferral query={`?type=chart`} /> : null}
    </Card>
  )
}
