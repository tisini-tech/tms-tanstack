import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import type { ApiResponse, CreateMatchEventPayload } from '#/lib/payloads'
import type {
  AgentFixture,
  CreateLineupPayload,
  MatchMetric,
  TeamLineup,
  Zone,
  MetricCategory,
} from '#/lib/types'

export const getMatchMetrics = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { fixType: string }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    params.set('with_details', 'true')
    if (data.fixType) {
      params.set('fixture_type', data.fixType)
    }

    const metrics = await apiService.get<MatchMetric[]>(
      `/metrics?${params.toString()}`,
    )

    return metrics
  })

export const matchMetricsQuery = (fixType: string) => ({
  queryKey: ['matchMetrics', fixType],
  queryFn: () => getMatchMetrics({ data: { fixType } }),
})

export const getTeamLineups = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { fixId: number; teamId?: number }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.teamId) {
      params.set('team_id', data.teamId.toString())
    }

    const lineups = await apiService.get<TeamLineup[]>(
      `/fixtures/${data.fixId}/lineups?${params.toString()}`,
    )

    return lineups
  })

export const teamLineupsQuery = (fixId: number, teamId?: number) => ({
  queryKey: ['teamLineups', fixId, teamId],
  queryFn: () => getTeamLineups({ data: { fixId, teamId } }),
})

export const getAgentFixtures = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const fixtures = await apiService.get<AgentFixture[]>('/agent-fixtures')

    return fixtures
  })

export const getZones = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { fixType: string }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.fixType) {
      params.set('fixture_type', data.fixType)
    }
    const zones = await apiService.get<Zone[]>(
      `/fixtures/zones/?${params.toString()}`,
    )

    return zones
  })

export const zonesQuery = (fixType: string) => ({
  queryKey: ['zones', fixType],
  queryFn: () => getZones({ data: { fixType } }),
})

export const getMetricCategories = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { fixType: string }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.fixType) {
      params.set('fixture_type', data.fixType)
    }
    const categories = await apiService.get<MetricCategory[]>(
      `/metric-categories?${params.toString()}`,
    )

    return categories
  })

export const metricCategoriesQuery = (fixType: string) => ({
  queryKey: ['metricCategories', fixType],
  queryFn: () => getMetricCategories({ data: { fixType } }),
})

export const createLineup = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { fixId: number; lineups: CreateLineupPayload[] }) => data)
  .handler(async ({ data }) => {
    const lineup = await apiService.post<TeamLineup[]>(
      `/fixtures/${data.fixId}/lineups`,
      data.lineups,
    )

    return lineup
  })

export const createMatchEvent = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      fixId: number
      event: CreateMatchEventPayload
      is_own_goal: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.is_own_goal) {
      params.set('is_own_goal', 'true')
    }

    const event = await apiService.post<ApiResponse>(
      `/fixtures/${data.fixId}/match-events?${params.toString()}`,
      data.event,
    )

    return event
  })
