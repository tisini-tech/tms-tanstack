import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import type { PaginatedResponse, Team } from '#/lib/types'

function teamsPath(opts?: { search?: string; pageSize?: number }) {
  const params = new URLSearchParams()
  const search = opts?.search?.trim()
  if (search) params.set('search', search)
  if (opts?.pageSize) params.set('page_size', String(opts.pageSize))
  const query = params.toString()
  return query ? `/teams?${query}` : '/teams'
}

export const getTeamsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { search?: string; pageSize?: number } | undefined) => ({
      search: data?.search ?? '',
      pageSize: data?.pageSize,
    }),
  )
  .handler(async ({ data }) => {
    const response = await apiService.get<PaginatedResponse<Team>>(
      teamsPath({ search: data.search, pageSize: data.pageSize }),
    )
    return response.results
  })

export const getTeamFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { teamId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Team>(`/teams/${data.teamId}`)
  })

/** Resolve a team by id, with search/name fallbacks for paginated lists. */
export const resolveTeamFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { teamId: number; teamName?: string }) => data)
  .handler(async ({ data }) => {
    const { teamId, teamName } = data

    try {
      return await apiService.get<Team>(`/teams/${teamId}`)
    } catch {
      // Detail route may not exist for all deployments
    }

    const name = teamName?.trim()
    if (name && !/^Team \d+$/i.test(name)) {
      const matches = await apiService.get<PaginatedResponse<Team>>(
        teamsPath({ search: name, pageSize: 100 }),
      )
      const hit = matches.results.find((team) => team.id === teamId)
      if (hit) return hit
    }

    const page = await apiService.get<PaginatedResponse<Team>>(
      teamsPath({ pageSize: 500 }),
    )
    return page.results.find((team) => team.id === teamId) ?? null
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
      teamsPath({ search: data.search }),
    )
    return response.results
  })
