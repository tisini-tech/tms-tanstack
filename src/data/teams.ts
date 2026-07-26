import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import type { PaginatedResponse, Team } from '#/lib/types'

export const getTeamsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const response = await apiService.get<PaginatedResponse<Team>>('/teams')
    const teams = response.results
    return teams
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
      `/teams?search=${data.search}`,
    )
    return response.results
  })
