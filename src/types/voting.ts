export interface FormationRow {
  line: string
  role: string
  slot: number
  label: string
  number: number | null
}

export interface Formation {
  rows: FormationRow[][]
  columns_per_row: number[]
  id: number
  name: string
  description: string
  match_type: string | number | null
  positions_order: FormationRow[]
}

export interface VotePlayer {
  id: number
  name: string
  current_position: string
  passportphoto: string | null
}

export interface VoteParticipant {
  id: number
  voting_cause: number
  name: string
  image_url: string | null
  video_url: string | null
  description: string | null
  slot: number | null
  player: VotePlayer | null
  total_votes: number
  team_name: string
  team_logo: string | null
}

export interface VoteSlotPlayer {
  participant_id: number
  name: string
  image_url: string | null
  slot: number
  picks: number
  team_name: string
  team_logo: string | null
  player: VotePlayer | null
}

export interface VoteSlot {
  slot: number
  role: string
  label: string
  line: string
  players: VoteSlotPlayer[]
}

export interface VoteTeamOfTheWeek {
  participant_id: number
  name: string
  image_url: string | null
  slot: number
  picks: number
  team_name: string
  team_logo: string | null
  player: VotePlayer | null
}

export interface VoteCause {
  id: number
  reason: string
  image_url: string | null
  date_from: string
  date_to: string
  tournament: number
  company: number | null
  vote_mode: string
  kind: string | null
  picks_required: number | null
  formation: Formation | Formation[] | null
  // optional fields for a single vote cause
  total_votes?: number
  ballots_casted?: number
  has_voted?: boolean
  participants?: VoteParticipant[]
  slots?: VoteSlot[]
  team_of_the_week?: VoteTeamOfTheWeek[]
}
