import type { ActiveOptions } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  activeOptions: ActiveOptions
}

export interface Module {
  name: string
  logo: React.ReactNode
  plan: string
  url: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
}

export interface PaginatedResponse<T> {
  previous: string
  next: string
  results: T[]
}

export interface Fixture {
  home_team: {
    id: number
    name: string
    teamlogo: string
  }
  away_team: {
    id: number
    name: string
    teamlogo: string
  }
  match_type: {
    id: number
    type_code: string
    type_name: string
  }
  competition: {
    id: number
    name: string
  }
  season: {
    id: number
    name: string
  }
  division: {
    id: number
    name: string
  }
  stage: {
    id: number
    name: string
  }
  venue: {
    id: number
    pitchname: string
    county: string
    latitude: string
    longitude: string
    country: number
  }
  id: number
  live: number
  team_view: number
  collection_mode: string
  status: string
  match_status: string
  match_moment: string
  matchday: string
  match_date: string
  match_time: string
  minute: number
  second: number
}

export interface SimpleFixture {
  id: number
  home_team: string
  home_team_id: number
  home_logo: string
  away_team: string
  away_team_id: number
  away_logo: string
  pitchname: string
  match_type: string
  competition: string
  season: string
  match_date: string
  matchday: string
  home_score: number
  away_score: number
  home_ht_score: number
  away_ht_score: number
}

export interface TimelineEvent {
  event_id: number
  event_name: string
  subevent_name: string
  team: number
  game_minute: number
  player_name: string
}

export interface TeamStats {
  event_id: number
  event_name: string
  home_count: number
  away_count: number
  sub_events: TeamSubEvent[]
}

export interface TeamSubEvent {
  subevent_id: number
  subevent_name: string
  home_count: number
  away_count: number
}

export interface EventSequence {
  team: number
  pass_count: number
  next_event: string
  player: string
  pass_type: string
  quarter: string
  minute: number
  second: number
  outcome: string
}

export interface FixtureEventSequence {
  home: EventSequence[]
  away: EventSequence[]
}

export interface FixtureTeamStats {
  fixture: SimpleFixture
  timeline: TimelineEvent[]
  stats: TeamStats[]
  sequences: FixtureEventSequence
}

export interface ReviewStats {
  fixture: SimpleFixture
  stats: TeamStats[]
  agents: AgentCounts[]
}

export interface AgentCounts {
  team_id: number
  agent_name: string
  agent_id: number
  total: number
}

export interface PlayerStats {
  event_id: number
  event_name: string
  total: number
  sub_events: PlayerSubEvent[]
}

export interface PlayerSubEvent {
  sub_event_id: number
  sub_event_name: string
  total: number
}

export interface SimpleTeam {
  team_id: number
  team_name: string
  team_logo: string
}

export interface FixturePlayerStats {
  id: number
  first_name: string
  sir_name: string
  other_name: string
  passportphoto: string
  jersey_number: number
  minutes_played: number
  rating: number
  team: SimpleTeam
  stats: PlayerStats[]
}

export interface PlayerQuarterStats {
  player_id: number
  name: string
  periods: { [quarter: string]: number }
}

export interface QuarterMetrics {
  shot_on_target: number
  total_shots: number
  chances: number
  complete_passes: number
  defensive_actions: number
}

export interface TeamQuarterStats {
  team_id: number
  quarters: Record<string, QuarterMetrics>
  players: PlayerQuarterStats[]
  average: Record<string, number>
}

export interface FixtureQuarterStats {
  home: TeamQuarterStats
  away: TeamQuarterStats
}

export interface PassMatrix {
  [passer: string]: { [receiver: string]: number }
}

export interface FixturePassMatrix {
  home: PassMatrix
  away: PassMatrix
}

export interface TeamType {
  id: number
  name: string
}

export interface Country {
  id: number
  name: string
  iso_code2: string
}

export interface Team {
  id: number
  name: string
  teamlogo: string
  team_type: TeamType
  country: Country
  short_name: string
  pricing: string
  referral: string
  organisation_id: number
  year_founded: number
  website_url: string
  description: string
}

export interface ReviewComment {
  id: number
  match: number
  team: number
  agent: number
  review: string[]
}
