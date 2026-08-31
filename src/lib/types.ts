import type { ActiveOptions } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  activeOptions: ActiveOptions
  /** When true, sidebar injects current competition `$compId` params. */
  needsCompId?: boolean
}

/** Module as returned by the auth API / stored in session */
export type Module = {
  id: number
  name: string
  display_name: string
  js: string
}

/** Module shaped for sidebar UI (filtered + enriched from catalog) */
export type SiteModule = {
  id: number
  name: string
  displayName: string
  logo: React.ReactNode
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

export interface PagePaginatedResponse<T> {
  page: number
  page_size: number
  total_pages: number
  total_items: number
  results: T[]
}

export interface Country {
  id: number
  name: string
  iso_code2: string
  iso_code3: string
  telephone_code: string
  nationality: string
}

export interface Season {
  id: number
  name: string
}

export interface Division {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
}

export interface Competition {
  id: number
  name: string
  country: Country
  logo: string
  description: string
  status: number
  seasons: Season[]
  divisions: Division[]
  categories: Category[]
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

export interface TopPlayerStats {
  player_id: number
  name: string
  passportphoto: string
  current_position: string
  jersey_no: number
  team_id: number
  team_name: string
  team_logo: string
  avg_rating: number
  matches_played: number
  total_minutes_played: number
  stats: PlayerStats[]
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
  stats: {
    players_registered: number
    players_fully_registered: number
    games_played: number
    games_won: number
    games_lost: number
  }
}

export interface ReviewComment {
  id: number
  match: number
  team: number
  agent: number
  review: string[]
}

export interface TypeObject {
  id: number
  name: string
}

export interface RawFixtureEvent {
  metric: TypeObject
  metric_detail: TypeObject | null
  metric_sub_detail: TypeObject | null
  player: TypeObject | null
  subplayer: TypeObject | null
  agent: TypeObject | null
  id: number
  match: number
  team: number
  minute: number
  second: number
  moment: string
  quarter: string
  narration: string
  zone_id: number
  xper: string
  yper: string
  video_timestamp: number
  no_ruck: string
  no_lineout: string
  meter_gain: string
  kickfrom: string
  kickland: string
  defender: string
  strength: number
  localid: string
  app_timelog: string
  sync_status: number
}

export interface ArticleCategory {
  id: number
  name: string
  slug: string
  description: string
}

export interface ArticleUser {
  id: number
  username: string
}

export interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  access_type: string
  status: string
  category: ArticleCategory
  keywords: string[]
  author: ArticleUser
  reviewed_by: ArticleUser
  rejection_reason: string
  created_at: string
  updated_at: string
  published_at: string
  is_locked: boolean
  is_mine: boolean
}

export interface Author {
  id: number
  user_id?: number
  display_name: string
  bio: string
  website: string
  twitter: string
  facebook: string
  instagram: string
  linkedin: string
  youtube: string
}

export const ID_DOCUMENT_TYPES = [
  'passport',
  'national_id',
  'birth_cert',
] as const

export type IdDocumentType = (typeof ID_DOCUMENT_TYPES)[number]

export const ID_DOCUMENT_TYPE_LABELS: Record<IdDocumentType, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  birth_cert: 'Birth Certificate',
}

export const ID_DOCUMENT_TYPE_OPTIONS = ID_DOCUMENT_TYPES.map((value) => ({
  value,
  label: ID_DOCUMENT_TYPE_LABELS[value],
}))

export function parseIdDocumentType(
  value: string | null | undefined,
): IdDocumentType | '' {
  if (
    value === 'passport' ||
    value === 'national_id' ||
    value === 'birth_cert'
  ) {
    return value
  }
  return ''
}

export interface Player {
  name: string
  nationality: string
  id: number
  current_position: string
  passportphoto: string
  fifa_id: string
  preferred_foot: string
  id_document_type: IdDocumentType | string | null
  id_document: string | null
  id_no: string
  dob: string
  country: number
  height: string
  weight: string
}

export interface TeamPlayer {
  player: Player
  id: number
  team: number
  current_jersey_no: number
  signed_date: string
  season_player_id: number | null
  front_img: string | null
  side_img: string | null
  action_img: string | null
}

export interface MetricDetail {
  id: number
  name: string
  metric: number
  position: number
  strength: number
  status: number
  needs_sub_details: number
}

export interface SubMetricDetail {
  id: number
  name: string
  position: number
  strength: number
  status: number
}

export interface Metrics {
  details: MetricDetail[]
  sub_details: SubMetricDetail[]
  id: number
  name: string
  fixture_type: number
  is_player: number
  is_timeline: number
  is_team: number
  is_active: number
  gke: number
  closewindow: number
  uploaddata: number
  ref: number
  order: number
  metric_category: number
  strength: number
}

export interface CompetitionImage {
  id: number
  image: string
  caption: string
  division: number
}
