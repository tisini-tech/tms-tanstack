import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getFixturePlayerStatsFn } from '#/data/stats'
import { Loading } from '#/components/general/errors/loading'
import {
  getFixturePassMatrixFn,
  getFixtureQuarterStatsFn,
  getFixtureReviewStatsFn,
  getFixtureTeamStatsFn,
} from '#/data/fixtures'

const navItems = [
  {
    label: 'Overview',
    to: '/super-agent/fixtures/$fixId',
    exact: true,
  },
  {
    label: 'Player Stats',
    to: '/super-agent/fixtures/$fixId/player-stats',
    exact: true,
  },
  {
    label: 'Event Review',
    to: '/super-agent/fixtures/$fixId/review',
    exact: true,
  },
  {
    label: 'Raw Events',
    to: '/super-agent/fixtures/$fixId/raw-events',
    exact: true,
  },
] as const

export const Route = createFileRoute('/_dashboard/competitions/fixtures/$fixId')(
  {
    loader: async ({ params: { fixId } }) => {
      const teamStats = await getFixtureTeamStatsFn({ data: { id: fixId } })
      const playerStats = await getFixturePlayerStatsFn({ data: { id: fixId } })
      const quarterStats = await getFixtureQuarterStatsFn({
        data: { id: fixId },
      })
      const passMatrix = await getFixturePassMatrixFn({ data: { id: fixId } })
      const reviewStats = await getFixtureReviewStatsFn({ data: { id: fixId } })

      return {
        teamStats,
        playerStats,
        quarterStats,
        passMatrix,
        reviewStats,
        fixId,
      }
    },
    component: RouteComponent,
    pendingComponent: Loading,
  },
)

function RouteComponent() {
  const { reviewStats, fixId } = Route.useLoaderData()
  const { fixture } = reviewStats

  const homeAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.home_team_id,
  )
  const awayAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.away_team_id,
  )

  const matchDate = fixture.match_date
    ? new Date(fixture.match_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Match
          </p>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Full Time
          </span>
        </div>

        <div className="grid items-center gap-6 p-4 md:grid-cols-[1fr_auto_1fr] md:p-6">
          <div className="flex flex-col items-center gap-3 text-center md:items-end md:text-right">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                {fixture.home_team}
              </h2>
              <p className="text-sm text-muted-foreground">
                Agent:{' '}
                <span className="text-foreground">{homeAgent?.agent_name}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/20 px-6 py-4">
            <div className="text-3xl font-bold tabular-nums text-foreground">
              {fixture.home_score} - {fixture.away_score}
            </div>
            {matchDate ? (
              <span className="text-sm text-muted-foreground">{matchDate}</span>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-destructive md:text-xl">
                {fixture.away_team}
              </h2>
              <p className="text-sm text-muted-foreground">
                Agent:{' '}
                <span className="text-foreground">{awayAgent?.agent_name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 border-t border-border">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              params={{ fixId }}
              activeOptions={{ exact: item.exact }}
              className="border-l border-border px-4 py-3 text-center text-sm font-medium transition-colors first:border-l-0"
              activeProps={{
                className: 'bg-muted/50 text-foreground',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <Outlet />
    </div>
  )
}
