import type {
  FixturePlayerStats,
  FixtureTeamStats,
  PlayerStats,
  TeamStats,
  TimelineEvent,
} from '#/lib/types'
import type {
  PlayerTableRow,
  ReportTeam,
  TableData,
  TableRowValue,
} from '#/components/pdf-reports/pdf-types'
import {
  getTeamId,
  getTeamName,
} from '#/components/pdf-reports/transform-report-data'
import { getPercent } from '#/lib/utils'

export const HOCKEY_ATTACK_METRICS = [
  'Score',
  'Shot',
  'Circle penetration',
  'Scoop',
  'Slap',
] as const

export const HOCKEY_DEFENSE_METRICS = [
  'Tackle',
  'Interception',
  'Foul',
  'Card',
  'Goalkeeper Save',
] as const

export const HOCKEY_BUILD_UP_METRICS = [
  'Pass',
  'Turnover',
  'Restart',
  'Lineball',
  'Substitute',
] as const

export const HOCKEY_PLAYER_COLUMNS = [
  { key: 'Player name', header: 'Player', width: 'name' as const },
  { key: 'rating', header: 'Rating', width: 'stat' as const },
  { key: 'mins', header: 'Mins', width: 'stat' as const },
  { key: 'Score', header: 'Score', width: 'narrow' as const },
  { key: 'Shot', header: 'Shot / on tgt', width: 'ratio' as const },
  { key: 'Circle penetration', header: 'Circle', width: 'narrow' as const },
  { key: 'Pass', header: 'Pass / acc', width: 'ratio' as const },
  { key: 'Turnover', header: 'TO', width: 'narrow' as const },
  { key: 'Tackle', header: 'Tackle / won', width: 'ratio' as const },
  { key: 'Interception', header: 'Int', width: 'narrow' as const },
  { key: 'Foul', header: 'Foul w/c', width: 'ratio' as const },
  { key: 'Goalkeeper Save', header: 'Save', width: 'narrow' as const },
  { key: 'Scoop', header: 'Scoop', width: 'narrow' as const },
  { key: 'Slap', header: 'Slap / acc', width: 'ratio' as const },
  { key: 'Card', header: 'Y / R', width: 'narrow' as const },
] as const

const SUCCESS_KEYWORDS = [
  'on target',
  'ontarget',
  'accurate',
  'complete',
  'successful',
  'success',
  'won',
  'retained',
]

const TEAM_RATIO_LABELS: Record<string, string> = {
  Shot: 'Shot / on target',
  Pass: 'Pass / complete',
  Tackle: 'Tackle / won',
  Slap: 'Slap / complete',
  Scoop: 'Scoop / complete',
  Foul: 'Foul won / comm',
  Card: 'Card yellow / red',
}

type NamedCount = { name: string; count: number }

function normalizeName(name: string) {
  return name.trim().toLowerCase()
}

function findTeamStat(stats: TeamStats[], eventName: string) {
  const target = normalizeName(eventName)
  return stats.find((row) => normalizeName(row.event_name) === target)
}

function findPlayerStat(stats: PlayerStats[], eventName: string) {
  const target = normalizeName(eventName)
  return stats.find((row) => normalizeName(row.event_name) === target)
}

function teamSubCounts(row: TeamStats, team: ReportTeam): NamedCount[] {
  return (row.sub_events ?? []).map((sub) => ({
    name: normalizeName(sub.subevent_name || ''),
    count: team === 'home' ? sub.home_count : sub.away_count,
  }))
}

function playerSubCounts(row: PlayerStats): NamedCount[] {
  return (row.sub_events ?? []).map((sub) => ({
    name: normalizeName(sub.sub_event_name || ''),
    count: sub.total,
  }))
}

function sumMatching(subs: NamedCount[], keywords: string[]) {
  return subs.reduce((sum, sub) => {
    if (keywords.some((keyword) => sub.name.includes(keyword))) {
      return sum + sub.count
    }
    return sum
  }, 0)
}

function successCount(subs: NamedCount[]) {
  return sumMatching(subs, SUCCESS_KEYWORDS)
}

function formatRatioCell(total: number, success: number): string {
  const pct = getPercent(total, success)
  return `${total} / ${success}  ${pct}%`
}

function formatTeamRatio(total: number, success: number): TableRowValue {
  return {
    stats: `${total} / ${success}`,
    acc: getPercent(total, success),
  }
}

function formatHockeyEvent(
  eventName: string,
  total: number,
  subs: NamedCount[],
  mode: 'team' | 'player',
): TableRowValue | string | number {
  const lowered = normalizeName(eventName)

  if (lowered.includes('card')) {
    const yellow = sumMatching(subs, ['yellow'])
    const red = sumMatching(subs, ['red'])
    if (yellow > 0 || red > 0 || subs.length > 0) {
      return mode === 'team'
        ? { stats: `${yellow} / ${red}`, acc: '' }
        : `${yellow} / ${red}`
    }
    return mode === 'team' ? { stats: total, acc: '' } : total
  }

  if (lowered.includes('foul')) {
    const won = sumMatching(subs, ['won'])
    const committed = sumMatching(subs, ['comm', 'against', 'conceded'])
    if (won > 0 || committed > 0) {
      return mode === 'team'
        ? { stats: `${won} / ${committed}`, acc: '' }
        : `${won} / ${committed}`
    }
  }

  const success = successCount(subs)
  if (subs.length > 0 && success > 0) {
    return mode === 'team'
      ? formatTeamRatio(total, success)
      : formatRatioCell(total, success)
  }

  // Sub-events exist but none matched success keywords — still show total / first positive sub if useful
  if (subs.length > 0) {
    const positive = subs.filter((sub) => sub.count > 0)
    if (positive.length === 1 && positive[0].count <= total) {
      return mode === 'team'
        ? formatTeamRatio(total, positive[0].count)
        : formatRatioCell(total, positive[0].count)
    }
  }

  return mode === 'team' ? { stats: total, acc: '' } : total
}

function teamRowLabel(eventName: string, value: TableRowValue): string {
  const ratioLabel = TEAM_RATIO_LABELS[eventName]
  if (!ratioLabel) return eventName
  if (typeof value.stats === 'string' && value.stats.includes('/')) {
    return ratioLabel
  }
  return eventName
}

function playerDisplayName(player: FixturePlayerStats) {
  return [player.first_name, player.sir_name, player.other_name]
    .filter(Boolean)
    .join(' ')
}

export function transformHockeyTeamStats(
  teamStats: FixtureTeamStats,
  team: ReportTeam,
): TableData {
  const rows: TableData = {
    Attack: 'section',
  }

  const appendMetric = (name: string) => {
    const row = findTeamStat(teamStats.stats, name)
    const total = row
      ? team === 'home'
        ? row.home_count
        : row.away_count
      : 0
    const value = formatHockeyEvent(
      name,
      total,
      row ? teamSubCounts(row, team) : [],
      'team',
    ) as TableRowValue
    rows[teamRowLabel(name, value)] = value
  }

  for (const name of HOCKEY_ATTACK_METRICS) appendMetric(name)

  rows.Defense = 'section'
  for (const name of HOCKEY_DEFENSE_METRICS) appendMetric(name)

  rows['Build-up'] = 'section'
  for (const name of HOCKEY_BUILD_UP_METRICS) appendMetric(name)

  return rows
}

export function transformHockeyPlayerStats(
  players: FixturePlayerStats[],
  teamId: number,
): PlayerTableRow[] {
  return players
    .filter((player) => player.team.team_id === teamId)
    .map((player) => {
      const row: PlayerTableRow = {
        'Player name': playerDisplayName(player),
        rating: player.rating ?? 0,
        mins: player.minutes_played ?? 0,
      }

      for (const column of HOCKEY_PLAYER_COLUMNS) {
        if (
          column.key === 'Player name' ||
          column.key === 'rating' ||
          column.key === 'mins'
        ) {
          continue
        }

        const stat = findPlayerStat(player.stats, column.key)
        row[column.key] = formatHockeyEvent(
          column.key,
          stat?.total ?? 0,
          stat ? playerSubCounts(stat) : [],
          'player',
        ) as string | number
      }

      return row
    })
    .sort((a, b) =>
      String(a['Player name']).localeCompare(String(b['Player name'])),
    )
}

export function hockeyTimelineMaxMinutes(events: TimelineEvent[]): number {
  const maxEvent = events.reduce(
    (max, event) => Math.max(max, event.game_minute || 0),
    0,
  )
  if (maxEvent <= 0) return 70
  return Math.ceil(maxEvent / 5) * 5
}

export function isHockeyScoreEvent(event: TimelineEvent) {
  const name = normalizeName(event.event_name)
  return name === 'score' || name.includes('goal')
}

export function isHockeyCardEvent(event: TimelineEvent) {
  return normalizeName(event.event_name).includes('card')
}

export { getTeamId, getTeamName }
