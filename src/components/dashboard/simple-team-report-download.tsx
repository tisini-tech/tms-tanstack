import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/utils'
import {
  GenSimpleTeamPDF,
  type SimpleTeamMatchOverview,
  type SimpleTeamSeasonKpis,
} from '#/components/pdf-reports/dash/simple-team-dash'
import type {
  DashboardMatch,
  DashboardSequences,
  DashboardTeamStats,
  MatchSequence,
} from '#/lib/types'

const SHOT = 238
const FOUL = 11
const THROW_IN = 12
const FOUL_THROW_SUB = 521
const ON_TARGET_SUB_IDS = new Set([606, 610, 422, 405])

type SeqSlice = Pick<
  MatchSequence,
  'below3' | 'btwn4to6' | 'btwn7to9' | 'over10' | 'total' | 'average'
>

export function SimpleTeamReportDownload({
  teamName,
  competitionName,
  matches,
  teamStats,
  sequences,
  opponentStats,
}: {
  teamName: string
  competitionName?: string
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  sequences: DashboardSequences | null
  opponentStats: DashboardTeamStats[] | DashboardTeamStats | null
}) {
  const [ready, setReady] = useState(false)
  const report = useMemo(
    () =>
      buildSimpleTeamVisPdfData({
        matches,
        teamStats,
        sequences,
        opponentStats,
      }),
    [matches, opponentStats, sequences, teamStats],
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

  const fileName = `${teamName.replace(/\s+/g, '_') || 'team'}_report.pdf`

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
        <GenSimpleTeamPDF
          teamName={teamName}
          competitionName={competitionName}
          season={report.season}
          matches={report.matches}
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

function buildSimpleTeamVisPdfData({
  matches,
  teamStats,
  sequences,
  opponentStats,
}: {
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  sequences: DashboardSequences | null
  opponentStats: DashboardTeamStats[] | DashboardTeamStats | null
}): {
  season: SimpleTeamSeasonKpis
  matches: SimpleTeamMatchOverview[]
} {
  const opponents = opponentList(opponentStats)
  const columns = matchColumns(matches).sort(
    (a, b) =>
      new Date(b.match.match_date).getTime() -
      new Date(a.match.match_date).getTime(),
  )
  const sequenceByMatch = new Map(
    (sequences?.matches ?? []).map((entry) => [entry.match_id, entry]),
  )

  const matchOverviews: SimpleTeamMatchOverview[] = columns.map((column) => {
    const matchId = column.match.match_id
    const sequence = sequenceByMatch.get(matchId)
    return {
      label: `vs ${column.label}`,
      matchDate: formatMatchDate(column.match.match_date),
      below3: sequence?.below3 ?? 0,
      btwn4to6: sequence?.btwn4to6 ?? 0,
      btwn7to9: sequence?.btwn7to9 ?? 0,
      over10: sequence?.over10 ?? 0,
      seqTotal: sequence?.total ?? 0,
      seqAverage: sequence?.average ?? 0,
      seqPoints: seqPoints(sequence),
      shotOn: subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS, matchId),
      shotTotal: eventTotal(teamStats, SHOT, matchId),
      facedOn: subTotal(opponents, SHOT, ON_TARGET_SUB_IDS, matchId),
      facedTotal: eventTotal(opponents, SHOT, matchId),
      fouls: eventTotal(teamStats, FOUL, matchId),
      foulThrows: subTotal(
        teamStats,
        THROW_IN,
        new Set([FOUL_THROW_SUB]),
        matchId,
      ),
    }
  })

  const games = matchOverviews.length || 1
  const totalSeqPoints = matchOverviews.reduce(
    (sum, match) => sum + match.seqPoints,
    0,
  )
  const shotOn = subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS)
  const shotTotal = eventTotal(teamStats, SHOT)
  const fouls = eventTotal(teamStats, FOUL)

  return {
    season: {
      games: matchOverviews.length,
      seqAverage: sequences?.average ?? 0,
      seqTotal: sequences?.total ?? 0,
      seqPointsTotal: totalSeqPoints,
      seqPointsAvg: matchOverviews.length > 0 ? totalSeqPoints / games : 0,
      shotOn,
      shotTotal,
      fouls,
    },
    matches: matchOverviews,
  }
}

/** Presence rule: ≥1 in 4–6 → +1, ≥1 in 7–9 → +2, ≥1 over 10 → +1. */
function seqPoints(sequence?: SeqSlice | null) {
  if (!sequence) return 0
  return (
    ((sequence.btwn4to6 ?? 0) > 0 ? 1 : 0) +
    ((sequence.btwn7to9 ?? 0) > 0 ? 2 : 0) +
    ((sequence.over10 ?? 0) > 0 ? 1 : 0)
  )
}

function opponentList(
  value: DashboardTeamStats[] | DashboardTeamStats | null | undefined,
) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function eventOf(stats: DashboardTeamStats[], eventId: number) {
  return stats.find((event) => event.event_id === eventId)
}

function eventTotal(
  stats: DashboardTeamStats[],
  eventId: number,
  matchId?: number,
) {
  const event = eventOf(stats, eventId)
  if (!event) return 0
  if (matchId == null) return event.total
  return event.matches.find((match) => match.match_id === matchId)?.total ?? 0
}

function subTotal(
  stats: DashboardTeamStats[],
  eventId: number,
  subIds: Set<number>,
  matchId?: number,
) {
  const event = eventOf(stats, eventId)
  if (!event) return 0

  return event.sub_events
    .filter(
      (sub) =>
        subIds.has(sub.sub_event_id) ||
        (eventId === SHOT && /on target/i.test(sub.sub_event_name)),
    )
    .reduce((total, sub) => {
      if (matchId == null) return total + sub.total
      return (
        total +
        (sub.matches.find((match) => match.match_id === matchId)?.total ?? 0)
      )
    }, 0)
}

function matchColumns(matches: DashboardMatch[]) {
  const bases = matches.map(opponentLabel)
  const duplicated = new Set(
    bases.filter((label, index) => bases.indexOf(label) !== index),
  )

  return matches.map((match, index) => {
    const base = bases[index] ?? match.label
    const label = duplicated.has(base)
      ? `${base} (${match.matchday || match.match_id})`
      : base
    return { match, label }
  })
}

function opponentLabel(match: DashboardMatch) {
  const versus = match.label.match(/vs\s+(.+?)\s+\(/i)
  return versus?.[1] ?? match.label
}

function formatMatchDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
