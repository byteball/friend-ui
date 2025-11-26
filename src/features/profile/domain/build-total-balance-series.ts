type TotalBalanceSeriesPoint = {
  trigger_date: string;
  totalBalance: number;
}

type RewardHistoryEvent = {
  trigger_date: string;
  locked_reward?: number | string;
  liquid_reward?: number | string;
  new_user_reward?: number | string;
  referral_reward?: number | string;
  total_balance_with_reducers: number;
  total_balance_sans_reducers: number;
}


/**
 * Builds a normalized total balance series with per-day snapshots.
 */
export function buildTotalBalanceSeries(
  events: RewardHistoryEvent[],
  decimals: number
): TotalBalanceSeriesPoint[] {
  if (!Array.isArray(events) || events.length === 0) {
    return []
  }

  const sortedEvents = [...events].sort((a, b) =>
    a.trigger_date.localeCompare(b.trigger_date)
  )

  const dailyTotals = new Map<string, number>()
  const eventDates = new Set<string>()
  const decimalsValue = Number.isFinite(Number(decimals)) ? Number(decimals) : 0
  const decimalsFactor = 10 ** decimalsValue || 1

  for (const event of sortedEvents) {
    const triggerDate = event.trigger_date?.slice(0, 10)
    if (!triggerDate) {
      continue
    }

    eventDates.add(triggerDate)

    const normalizedTotal = event.total_balance_sans_reducers / decimalsFactor

    if (!Number.isFinite(normalizedTotal)) {
      continue
    }

    // prefer the latest total per day, events are already sorted chronologically
    dailyTotals.set(triggerDate, normalizedTotal)
  }

  const earliestRewardDate =
    [...dailyTotals.keys()].sort()[0] ?? [...eventDates].sort()[0]

  if (!earliestRewardDate) {
    return []
  }

  const startDate = new Date(`${earliestRewardDate}T00:00:00Z`)
  const todayUtc = new Date()
  todayUtc.setUTCHours(0, 0, 0, 0)

  const cumulativeSeries: TotalBalanceSeriesPoint[] = []
  let lastKnownTotal = 0

  for (
    const cursor = new Date(startDate);
    cursor <= todayUtc;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const cursorKey = cursor.toISOString().slice(0, 10)
    if (dailyTotals.has(cursorKey)) {
      lastKnownTotal = dailyTotals.get(cursorKey) ?? lastKnownTotal
    }

    cumulativeSeries.push({
      trigger_date: cursorKey,
      totalBalance: lastKnownTotal,
    })
  }

  return cumulativeSeries
}