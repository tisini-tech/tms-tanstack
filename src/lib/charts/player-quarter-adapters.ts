import type { PlayerQuarterStats } from '#/lib/types'

import {
  TIME_INTERVALS,
  type AverageQuarterStats,
  type PlayerQuarterStat,
} from './generate-player-chart'

function mapPeriodsToIntervals(
  periods: Record<string, number>,
): Record<(typeof TIME_INTERVALS)[number], number> {
  const hasIntervalKeys = TIME_INTERVALS.some((label) => label in periods)

  if (hasIntervalKeys) {
    return TIME_INTERVALS.reduce(
      (result, label) => {
        result[label] = periods[label] ?? 0
        return result
      },
      {} as Record<(typeof TIME_INTERVALS)[number], number>,
    )
  }

  const keys = Object.keys(periods).sort(
    (left, right) => Number(left) - Number(right),
  )

  return TIME_INTERVALS.reduce(
    (result, label, index) => {
      const key = keys[index]
      result[label] = key ? (periods[key] ?? 0) : 0
      return result
    },
    {} as Record<(typeof TIME_INTERVALS)[number], number>,
  )
}

export function toPlayerQuarterStat(
  player: PlayerQuarterStats,
): PlayerQuarterStat {
  const intervals = mapPeriodsToIntervals(player.periods)

  return {
    name: player.name,
    ...intervals,
  }
}

export function toAverageQuarterStats(
  average: Record<string, number>,
): AverageQuarterStats {
  return mapPeriodsToIntervals(average)
}
