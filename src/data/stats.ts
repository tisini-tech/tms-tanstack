import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type {
  FixturePlayerStats,
  PaginatedResponse,
  TopPlayerStats,
} from '#/lib/types'
import { queryOptions } from '@tanstack/react-query'

export const getTopPlayersStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      competitionId: number
      seasonId: number
      divisionId?: number
      categoryId?: number
      rounds?: string[]
      month?: string
      minMatches?: number
      teamId?: number
      isAttacking?: boolean
      isDefensive?: boolean
      isGoalkeeping?: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()

    params.set('page_size', '100')

    if (data.divisionId != null) {
      params.set('division_id', String(data.divisionId))
    }
    for (const round of data.rounds ?? []) {
      params.append('round', round)
    }
    if (data.month) {
      params.set('month', data.month)
    }
    if (data.categoryId != null) {
      params.set('category_id', String(data.categoryId))
    }
    if (data.minMatches != null) {
      params.set('min_matches', String(data.minMatches))
    }
    if (data.teamId != null) {
      params.set('team_id', String(data.teamId))
    }
    if (data.isAttacking != null) {
      params.set('is_attack', String(data.isAttacking))
    }
    if (data.isDefensive != null) {
      params.set('is_defense', String(data.isDefensive))
    }
    if (data.isGoalkeeping != null) {
      params.set('is_goalkeeper', String(data.isGoalkeeping))
    }

    const playersStats = await apiService.get<
      PaginatedResponse<TopPlayerStats>
    >(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/top-rated-players?${params.toString()}`,
    )

    return playersStats
  })

export const topPlayersStatsQueryOptions = (
  competitionId: number,
  seasonId: number,
  divisionId?: number,
  categoryId?: number,
  rounds?: string[],
  month?: string,
  minMatches?: number,
  teamId?: number,
  isAttacking?: boolean,
  isDefensive?: boolean,
  isGoalkeeping?: boolean,
) =>
  queryOptions({
    queryKey: [
      'topPlayersStats',
      competitionId,
      seasonId,
      divisionId,
      categoryId,
      rounds,
      month,
      minMatches,
      teamId,
      isAttacking,
      isDefensive,
      isGoalkeeping,
    ],
    queryFn: () =>
      getTopPlayersStatsFn({
        data: {
          competitionId,
          seasonId,
          divisionId,
          categoryId,
          rounds,
          month,
          minMatches,
          teamId,
          isAttacking,
          isDefensive,
          isGoalkeeping,
        },
      }),
    enabled: competitionId != null && seasonId != null,
  })

export const getFixturePlayerStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const playerStats = await apiService.get<FixturePlayerStats[]>(
      `/fixtures/${data.id}/player-stats`,
    )
    return playerStats
  })
