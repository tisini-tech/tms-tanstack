import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/utils'
import {
  GenSimpleLeaguePDF,
  type SimpleLeagueSeasonKpis,
  type SimpleLeagueTeamRow,
} from '#/components/pdf-reports/dash/simple-league-dash'
import type {
  LeagueDashboard,
  LeagueDashboardEvent,
  LeagueDashboardSubEvent,
  SimpleLeagueDashboardTeam,
} from '#/lib/types'

const SHOT = 238
const FOUL = 11
const THROW_IN = 12
const FOUL_THROW_SUB = 521
const ON_TARGET_SUB_IDS = new Set([606, 610, 422, 405])

export function SimpleLeagueReportDownload({
  dashboard,
  seqPointsByTeamId = {},
  competitionName,
  seasonName,
  divisionName,
  categoryName,
}: {
  dashboard: LeagueDashboard
  seqPointsByTeamId?: Record<number, number>
  competitionName?: string
  seasonName?: string
  divisionName?: string
  categoryName?: string
}) {
  const [ready, setReady] = useState(false)
  const report = useMemo(
    () => buildLeagueVisPdfData(dashboard, seqPointsByTeamId),
    [dashboard, seqPointsByTeamId],
  )

  useEffect(() => {
    let cancelled = false
    void ensurePdfPolyfills().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const headerTitle = [competitionName, seasonName, divisionName, categoryName]
    .filter(Boolean)
    .join(' | ')

  const fileName = `${(competitionName || 'league').replace(/\s+/g, '_')}_report.pdf`

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        <DownloadIcon />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <GenSimpleLeaguePDF
          title={headerTitle || 'League Dashboard'}
          season={report.season}
          teams={report.teams}
        />
      }
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <DownloadIcon />
          {loading ? 'Generating...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

function buildLeagueVisPdfData(
  dashboard: LeagueDashboard,
  seqPointsByTeamId: Record<number, number>,
): {
  season: SimpleLeagueSeasonKpis
  teams: SimpleLeagueTeamRow[]
} {
  const shot = shotEvent(dashboard.events)
  const fouls = foulEvent(dashboard.events)?.teams ?? []
  const foulThrows = foulThrowTeams(dashboard.events)

  const teams: SimpleLeagueTeamRow[] = dashboard.teams
    .map((team) => {
      const shotOn = shot
        ? shot.sub_events
            .filter(isOnTarget)
            .reduce((sum, sub) => sum + totalFor(sub.teams, team.team_id), 0)
        : 0
      const shotTotal = shot ? totalFor(shot.teams, team.team_id) : 0

      return {
        name: team.name,
        games: team.games,
        below3: team.sequences?.below3 ?? 0,
        btwn4to6: team.sequences?.btwn4to6 ?? 0,
        btwn7to9: team.sequences?.btwn7to9 ?? 0,
        over10: team.sequences?.over10 ?? 0,
        seqTotal: team.sequences?.total ?? 0,
        seqAverage: team.sequences?.average ?? 0,
        seqPoints: seqPointsByTeamId[team.team_id] ?? 0,
        shotOn,
        shotTotal,
        fouls: totalFor(fouls, team.team_id),
        foulThrows: totalFor(foulThrows, team.team_id),
      }
    })
    .sort((a, b) => {
      if (b.seqAverage !== a.seqAverage) return b.seqAverage - a.seqAverage
      return a.name.localeCompare(b.name)
    })

  const teamCount = teams.length || 1
  const seqTotal = teams.reduce((sum, team) => sum + team.seqTotal, 0)
  const seqAverage =
    teams.reduce((sum, team) => sum + team.seqAverage, 0) / teamCount
  const seqPointsTotal = teams.reduce((sum, team) => sum + team.seqPoints, 0)
  const shotOn = teams.reduce((sum, team) => sum + team.shotOn, 0)
  const shotTotal = teams.reduce((sum, team) => sum + team.shotTotal, 0)
  const foulsTotal = teams.reduce((sum, team) => sum + team.fouls, 0)

  return {
    season: {
      teams: teams.length,
      gamesMax: Math.max(...teams.map((team) => team.games), 0),
      seqAverage,
      seqTotal,
      seqPointsTotal,
      seqPointsAvg: seqPointsTotal / teamCount,
      shotOn,
      shotTotal,
      fouls: foulsTotal,
    },
    teams,
  }
}

function shotEvent(events: LeagueDashboardEvent[]) {
  return events.find((event) => event.event_id === SHOT)
}

function foulEvent(events: LeagueDashboardEvent[]) {
  return events.find((event) => event.event_id === FOUL)
}

function foulThrowTeams(events: LeagueDashboardEvent[]) {
  const throwIn = events.find((event) => event.event_id === THROW_IN)
  const sub = throwIn?.sub_events.find(
    (entry) =>
      entry.sub_event_id === FOUL_THROW_SUB ||
      /foul throw/i.test(entry.sub_event_name),
  )
  return sub?.teams ?? []
}

function isOnTarget(sub: LeagueDashboardSubEvent) {
  return (
    ON_TARGET_SUB_IDS.has(sub.sub_event_id) ||
    /on target/i.test(sub.sub_event_name)
  )
}

function totalFor(values: SimpleLeagueDashboardTeam[], teamId: number) {
  return values.find((entry) => entry.team_id === teamId)?.total ?? 0
}
