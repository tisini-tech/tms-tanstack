import type { AgentCounts, ReviewStats, SimpleFixture, TeamStats } from '#/lib/types'

import { formatAgentName } from './format-agent-name'

export type ReviewTeamSide = 'home' | 'away'

export interface ReviewTableColumn {
  key: string
  agentLabel: string
}

export interface ReviewTableSubEventRow {
  subeventId: number
  name: string
  values: Record<string, number>
}

export interface ReviewTableEventRow {
  eventId: number
  eventName: string
  values: Record<string, number>
  subEvents: ReviewTableSubEventRow[]
}

export interface ReviewTableData {
  fixture: SimpleFixture
  fixtureLabel: string
  teamLabel: string
  columns: ReviewTableColumn[]
  rows: ReviewTableEventRow[]
}

type TeamMatch = {
  entry: ReviewStats
  side: ReviewTeamSide
  agents: AgentCounts[]
}

function columnKey(agent: AgentCounts, fixtureId: number): string {
  return `${fixtureId}:${agent.agent_id}`
}

export function resolveTeamSide(
  fixture: SimpleFixture,
  teamName: string,
): ReviewTeamSide | null {
  if (fixture.home_team === teamName) return 'home'
  if (fixture.away_team === teamName) return 'away'
  return null
}

export function getTeamsFromReviewStats(reviewStats: ReviewStats[]): string[] {
  const names = reviewStats.flatMap(({ fixture }) => [
    fixture.home_team,
    fixture.away_team,
  ])

  return [...new Set(names)].filter(Boolean)
}

function agentsForTeam(
  reviewStats: ReviewStats,
  teamName: string,
): { side: ReviewTeamSide; agents: AgentCounts[] } | null {
  const side = resolveTeamSide(reviewStats.fixture, teamName)
  if (!side) return null

  const { fixture, agents } = reviewStats
  const teamId =
    side === 'home' ? fixture.home_team_id : fixture.away_team_id

  return {
    side,
    agents: agents.filter((agent) => agent.team_id === teamId),
  }
}

function collectTeamMatches(
  reviewStatsList: ReviewStats[],
  teamName: string,
): TeamMatch[] {
  const matches: TeamMatch[] = []

  for (const entry of reviewStatsList) {
    const teamMatch = agentsForTeam(entry, teamName)
    if (!teamMatch || teamMatch.agents.length === 0) continue
    matches.push({ entry, ...teamMatch })
  }

  return matches
}

function sideCount(side: ReviewTeamSide, homeCount: number, awayCount: number) {
  return side === 'home' ? homeCount : awayCount
}

/**
 * Builds a comparison table with one column per agent that covered `teamName`
 * across the selected fixtures.
 */
export function transformReviewStats(
  reviewStatsList: ReviewStats[],
  teamName: string,
): ReviewTableData | null {
  const matches = collectTeamMatches(reviewStatsList, teamName)
  if (matches.length === 0) return null

  const columns: ReviewTableColumn[] = matches.flatMap(({ entry, agents }) =>
    agents.map((agent) => ({
      key: columnKey(agent, entry.fixture.id),
      agentLabel: formatAgentName(agent.agent_name),
    })),
  )

  const eventMap = new Map<number, ReviewTableEventRow>()

  for (const { entry, side, agents } of matches) {
    for (const event of entry.stats as TeamStats[]) {
      let row = eventMap.get(event.event_id)
      if (!row) {
        row = {
          eventId: event.event_id,
          eventName: event.event_name,
          values: {},
          subEvents: [],
        }
        eventMap.set(event.event_id, row)
      }

      const count = sideCount(side, event.home_count, event.away_count)
      for (const agent of agents) {
        row.values[columnKey(agent, entry.fixture.id)] = count
      }

      for (const subEvent of event.sub_events ?? []) {
        let subRow = row.subEvents.find(
          (item) => item.subeventId === subEvent.subevent_id,
        )
        if (!subRow) {
          subRow = {
            subeventId: subEvent.subevent_id,
            name: subEvent.subevent_name,
            values: {},
          }
          row.subEvents.push(subRow)
        }

        const subCount = sideCount(
          side,
          subEvent.home_count,
          subEvent.away_count,
        )
        for (const agent of agents) {
          subRow.values[columnKey(agent, entry.fixture.id)] = subCount
        }
      }
    }
  }

  const fixtureLabels = [
    ...new Set(
      matches.map(
        ({ entry }) =>
          `${entry.fixture.home_team} vs ${entry.fixture.away_team}`,
      ),
    ),
  ]

  return {
    fixture: matches[0].entry.fixture,
    fixtureLabel: fixtureLabels.join(' · '),
    teamLabel: teamName,
    columns,
    rows: [...eventMap.values()],
  }
}
