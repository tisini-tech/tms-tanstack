import { apiService } from '#/lib/api'
import type { VoteCause } from '#/types/voting'
import { createServerFn } from '@tanstack/react-start'
import { authFnMiddleware } from '#/middlewares/auth'
import { queryOptions } from '@tanstack/react-query'

export const getVoteCauses = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const causes = await apiService.get<VoteCause[]>('/causes')

    return causes
  })

export const voteCauseQueryOptions = queryOptions({
  queryKey: ['vote-causes'],
  queryFn: getVoteCauses,
})

export const getVoteCauseById = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { causeId: string }) => data)
  .handler(async ({ data }) => {
    const cause = await apiService.get<VoteCause>(
      `/causes/${data.causeId}/participants`,
    )
    return cause
  })

export const voteCauseByIdQueryOptions = (causeId: string) =>
  queryOptions({
    queryKey: ['vote-cause-by-id', causeId],
    queryFn: () => getVoteCauseById({ data: { causeId } }),
  })
