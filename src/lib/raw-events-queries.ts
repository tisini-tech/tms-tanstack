import { queryOptions } from '@tanstack/react-query'

import { getFixtureRawEventsFn } from '#/data/fixtures'
import { getMetricsFn } from '#/data/metrics'
import { getPlayersFn } from '#/data/players'

export function toFixtureType(matchType: string) {
  const normalized = matchType.trim().toLowerCase()
  if (!normalized) return 'football'
  if (normalized.includes('football') || normalized.includes('soccer')) {
    return 'football'
  }
  return normalized.replace(/\s+/g, '_')
}

export const rawEventsQuery = (id: string) =>
  queryOptions({
    queryKey: ['fixture-raw-events', id],
    queryFn: () => getFixtureRawEventsFn({ data: { id } }),
  })

export const metricsQuery = (fixType: string) =>
  queryOptions({
    queryKey: ['fixture-metrics', fixType],
    queryFn: () => getMetricsFn({ data: { fixType } }),
  })

export const teamPlayersQuery = (teamId: number) =>
  queryOptions({
    queryKey: ['team-players', teamId],
    queryFn: () => getPlayersFn({ data: { teamId: String(teamId) } }),
  })
