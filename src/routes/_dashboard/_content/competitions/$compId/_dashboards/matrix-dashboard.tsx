import { z } from 'zod'
import { useMemo, useState } from 'react'
import {
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { getMatrixDashboardFn } from '#/data/teams'
import type { MatrixDashboard, Team } from '#/lib/types'
import { TeamSelect, teamsInCategory } from './team-dashboard'

import {
  categoryNameFor,
  PassMatrixGrid,
  sumMatrices,
  topCombinations,
} from '#/components/dashboard/matrix'
import { FixtureMenu } from '#/components/dashboard/fixtures-menu'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/_dashboards/matrix-dashboard',
)({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId, seasonId, divisionId, categoryId } }) => ({
    teamId,
    seasonId,
    divisionId,
    categoryId,
  }),
  loader: async ({
    params: { compId },
    deps: { teamId, seasonId, divisionId, categoryId },
    parentMatchPromise,
  }) => {
    const parentMatch = await parentMatchPromise
    const teams =
      (parentMatch?.loaderData as { teams: Team[] } | undefined)?.teams ?? []

    if (!seasonId) {
      throw new Error('Season ID is required')
    }

    const categoryName = await categoryNameFor(compId, categoryId)
    const visibleTeams = teamsInCategory(teams, categoryName)
    const selectedTeamId =
      teamId != null && visibleTeams.some((team) => team.id === teamId)
        ? teamId
        : visibleTeams[0]?.id

    if (selectedTeamId != null && selectedTeamId !== teamId) {
      throw redirect({
        to: '/competitions/$compId/matrix-dashboard',
        params: { compId },
        search: {
          teamId: selectedTeamId,
          seasonId,
          divisionId,
          categoryId,
        },
        replace: true,
      })
    }

    if (selectedTeamId == null) {
      return {
        teams,
        categoryName,
        selectedTeamId: undefined as number | undefined,
        matrixDashboard: [] as MatrixDashboard[],
      }
    }

    const matrixDashboard = await getMatrixDashboardFn({
      data: {
        competitionId: compId,
        seasonId: seasonId.toString(),
        teamId: selectedTeamId.toString(),
      },
    })

    return { teams, categoryName, selectedTeamId, matrixDashboard }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { compId } = Route.useParams()
  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (state) => state.isLoading })
  const { teams, categoryName, selectedTeamId, matrixDashboard } =
    Route.useLoaderData()

  const teamItems = useMemo(
    () =>
      teamsInCategory(teams, categoryName).map((team) => ({
        value: team.id.toString(),
        label: team.name,
      })),
    [teams, categoryName],
  )
  const teamName = teams.find((team) => team.id === selectedTeamId)?.name ?? ''
  const matches = useMemo(
    () =>
      [...matrixDashboard].sort((left, right) => {
        const delta =
          Date.parse(left.fixture.match_date) -
          Date.parse(right.fixture.match_date)
        return delta || left.fixture.id - right.fixture.id
      }),
    [matrixDashboard],
  )
  const [picked, setPicked] = useState<{
    teamId: number | undefined
    ids: Set<number>
  } | null>(null)
  const selectedIds = useMemo(() => {
    if (picked == null || picked.teamId !== selectedTeamId) {
      return new Set(matches.map((match) => match.fixture.id))
    }
    return picked.ids
  }, [picked, selectedTeamId, matches])
  const matrix = useMemo(
    () => sumMatrices(matches, selectedIds),
    [matches, selectedIds],
  )
  const leaders = useMemo(() => topCombinations(matrix), [matrix])
  const lead = leaders[0]

  function handleTeamChange(value: string | null) {
    if (value == null) return
    const nextTeamId = Number(value)
    if (!Number.isFinite(nextTeamId) || nextTeamId === selectedTeamId) return
    void navigate({
      to: '/competitions/$compId/matrix-dashboard',
      params: { compId },
      search: (prev) => ({
        ...prev,
        teamId: nextTeamId,
      }),
    })
  }

  function setFixtureIds(ids: Set<number>) {
    setPicked({ teamId: selectedTeamId, ids })
  }

  function toggleFixture(id: number) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFixtureIds(next)
  }

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-80 w-full min-w-0 flex-col gap-2 sm:h-[calc(100dvh-5rem)]">
      <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <TeamSelect
          items={teamItems}
          value={selectedTeamId?.toString()}
          onValueChange={handleTeamChange}
        />
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {lead ? (
            <p
              className="flex h-8 min-w-0 items-center gap-1.5 rounded-2xl bg-primary/15 px-3 text-sm ring-1 ring-primary/50"
              title={leaders
                .map((pair) => `${pair.passer} - ${pair.receiver}`)
                .join(', ')}
            >
              <span className="truncate font-medium">{lead.passer}</span>
              <span className="text-muted-foreground">-</span>
              <span className="truncate font-medium">{lead.receiver}</span>
              <span className="shrink-0 tabular-nums">{lead.count}</span>
              {leaders.length > 1 ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  +{leaders.length - 1}
                </span>
              ) : null}
            </p>
          ) : null}
          {matches.length > 0 ? (
            <FixtureMenu
              matches={matches}
              teamName={teamName}
              selectedIds={selectedIds}
              onToggle={toggleFixture}
              onSetAll={(on) =>
                setFixtureIds(
                  on
                    ? new Set(matches.map((match) => match.fixture.id))
                    : new Set(),
                )
              }
            />
          ) : null}
        </div>
      </div>

      {selectedTeamId == null ? (
        <p className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
          {teams.length === 0
            ? 'No teams in this competition yet.'
            : teamItems.length === 0
              ? `No teams match ${categoryName}.`
              : 'Select a team to view the pass matrix.'}
        </p>
      ) : matches.length === 0 ? (
        <p className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
          No pass matrices for this team yet.
        </p>
      ) : (
        <section
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card',
            isLoading && 'pointer-events-none opacity-50',
          )}
        >
          <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
            {selectedIds.size === 0 ? (
              <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Select fixtures to total their passes.
              </p>
            ) : (
              <PassMatrixGrid matrix={matrix} />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
