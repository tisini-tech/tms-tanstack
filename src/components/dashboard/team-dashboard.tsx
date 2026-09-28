import EventsTable from './events-table'
import QuartersTable from './quarters-table'
import PlayersTable from './players-table'
import type { DashboardFilters } from './dashboard-filters'
import type {
  DashboardMatch,
  PlayerAppearance,
  DashboardPlayerStats,
  DashboardTeamStats,
  DashboardQuarterStats,
} from '#/lib/types'

export default function TeamDashboard({
  matches,
  teamStats,
  filters,
  setFilters,
  quarterStats,
  playerStats,
  playerAppearances,
}: {
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  filters: DashboardFilters
  setFilters: (filters: DashboardFilters) => void
  quarterStats: DashboardQuarterStats[]
  playerStats: DashboardPlayerStats[]
  playerAppearances: PlayerAppearance[]
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-5">
      <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-4">
        <div className="min-h-0 flex-1">
          <EventsTable
            matches={matches}
            teamStats={teamStats}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        <div className="min-h-0 basis-[28%] shrink-0 grow-0">
          <QuartersTable
            matches={matches}
            quarterStats={quarterStats}
            filters={filters}
          />
        </div>
      </div>

      <div className="min-h-0 min-w-0 lg:col-span-1">
        <PlayersTable
          playerStats={playerStats}
          appearances={playerAppearances}
          filters={filters}
        />
      </div>
    </div>
  )
}
