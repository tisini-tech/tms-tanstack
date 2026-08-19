import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import type { PaginatedResponse, Team } from '#/lib/types'

function teamsPath(search?: string) {
  const trimmed = search?.trim()
  if (!trimmed) return '/teams'
  return `/teams?search=${encodeURIComponent(trimmed)}`
}

export const getTeamsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { search?: string } | undefined) => ({
    search: data?.search ?? '',
  }))
  .handler(async ({ data }) => {
    const response = await apiService.get<PaginatedResponse<Team>>(
      teamsPath(data.search),
    )
    return response.results
  })

export const getTeamFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { teamId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Team>(`/teams/${data.teamId}`)
  })

export const updateTeamFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { team: Team }) => data)
  .handler(async ({ data }) => {
    const response = await apiService.patch<Team>(
      `/teams/${data.team.id}`,
      data.team,
    )
    return response
  })

export const searchTeamsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { search: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiService.get<PaginatedResponse<Team>>(
      teamsPath(data.search),
    )
    return response.results
  })
