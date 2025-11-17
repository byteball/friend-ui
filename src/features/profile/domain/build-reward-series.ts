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
  total_balance: number
}


/**
 * Builds a cumulative reward series with normalized daily points.
 */
export function buildRewardSeries(
  events: RewardHistoryEvent[],
  decimals: number
): RewardSeriesPoint[] {
  if (!Array.isArray(events) || events.length === 0) {
    return []
  }

  const sortedEvents = [...events].sort((a, b) =>
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

    const totalInBaseUnits = event.total_balance;

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