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

function columnKey(agent: AgentCounts, index: number): string {
  return `${agent.team_id}:${index}`
}

export function resolveTeamSide(
  fixture: SimpleFixture,
  teamName: string,
): ReviewTeamSide | null {
  if (fixture.home_team === teamName) return 'home'
  if (fixture.away_team === teamName) return 'away'
  return null
}

export function getTeamsFromReviewStats(
  reviewStats: ReviewStats[],
): string[] {
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

function buildRowValues(
  teamAgents: AgentCounts[],
  side: ReviewTeamSide,
  homeCount: number,
  awayCount: number,
): Record<string, number> {
  const count = side === 'home' ? homeCount : awayCount

  return Object.fromEntries(
    teamAgents.map((agent, index) => [columnKey(agent, index), count]),
  )
}

export function transformReviewStats(
  reviewStats: ReviewStats,
  teamName: string,
): ReviewTableData | null {
  const teamMatch = agentsForTeam(reviewStats, teamName)
  if (!teamMatch) return null

  const { fixture, stats } = reviewStats
  const { side, agents: teamAgents } = teamMatch

  const columns: ReviewTableColumn[] = teamAgents.map((agent, index) => ({
    key: columnKey(agent, index),
    agentLabel: formatAgentName(agent.agent_name),
  }))

  const rows: ReviewTableEventRow[] = stats.map((event: TeamStats) => ({
    eventId: event.event_id,
    eventName: event.event_name,
    values: buildRowValues(
      teamAgents,
      side,
      event.home_count,
      event.away_count,
    ),
    subEvents: (event.sub_events ?? []).map((subEvent) => ({
      subeventId: subEvent.subevent_id,
      name: subEvent.subevent_name,
      values: buildRowValues(
        teamAgents,
        side,
        subEvent.home_count,
        subEvent.away_count,
      ),
    })),
  }))

  return {
    fixture,
    fixtureLabel: `${fixture.home_team} vs ${fixture.away_team}`,
    teamLabel: teamName,
    columns,
    rows,
  }
}
