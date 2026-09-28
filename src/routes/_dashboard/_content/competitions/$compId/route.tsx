import { useEffect } from 'react'
import { z } from 'zod'
import {
  Outlet,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { Loading } from '#/components/general/errors/loading'
import { competitionQueryOptions } from '#/data/competitions'
import {
  rememberCompetitionFilters,
  rememberCompetitionId,
  resolveCompetitionFilters,
} from '#/lib/competition-context'

export const competitionContextSearchSchema = z.object({
  seasonId: z.coerce.number().optional(),
  divisionId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
})

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId',
)({
  validateSearch: competitionContextSearchSchema,
  beforeLoad: async ({ context, params, search, location }) => {
    const competitions = await context.queryClient.ensureQueryData(
      competitionQueryOptions,
    )
    const competition = competitions.find(
      (entry) => entry.id === Number(params.compId),
    )
    if (!competition) return

    const resolved = resolveCompetitionFilters(competition, search)
    const changed =
      resolved.seasonId !== search.seasonId ||
      resolved.divisionId !== search.divisionId ||
      resolved.categoryId !== search.categoryId
    if (!changed) return

    const next = new URLSearchParams(location.searchStr)
    if (resolved.seasonId != null) {
      next.set('seasonId', String(resolved.seasonId))
    }
    if (resolved.divisionId != null) {
      next.set('divisionId', String(resolved.divisionId))
    }
    if (resolved.categoryId != null) {
      next.set('categoryId', String(resolved.categoryId))
    }
    const query = next.toString()

    throw redirect({
      href: query ? `${location.pathname}?${query}` : location.pathname,
      replace: true,
    })
  },
  loader: async ({ context, params }) => {
    const competitions = await context.queryClient.ensureQueryData(
      competitionQueryOptions,
    )
    const competition = competitions.find(
      (entry) => entry.id === Number(params.compId),
    )
    if (!competition) {
      throw notFound()
    }

    return { competitions, competition }
  },
  component: CompetitionWorkspaceLayout,
  pendingComponent: Loading,
})

function CompetitionWorkspaceLayout() {
  const { competition } = Route.useLoaderData()
  const { compId } = Route.useParams()
  const search = Route.useSearch()
  // Unbound navigate + `to: '.'` keeps the current full path
  // (Route.useNavigate would remount `$compId` and drop child routes).
  const navigate = useNavigate()

  useEffect(() => {
    rememberCompetitionId(compId)
  }, [compId])

  // Keep season / division / category in the URL (defaults + last used)
  useEffect(() => {
    const resolved = resolveCompetitionFilters(competition, search)
    const changed =
      resolved.seasonId !== search.seasonId ||
      resolved.divisionId !== search.divisionId ||
      resolved.categoryId !== search.categoryId

    if (changed) {
      void navigate({
        to: '.',
        search: (prev) => ({
          ...prev,
          ...resolved,
        }),
        replace: true,
      })
    }

    rememberCompetitionFilters(compId, resolved)
  }, [
    competition,
    compId,
    navigate,
    search.seasonId,
    search.divisionId,
    search.categoryId,
  ])

  return <Outlet />
}
