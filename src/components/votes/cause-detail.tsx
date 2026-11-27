import { useMemo, useState } from 'react'
import { TrophyIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import type {
  Formation,
  FormationRow,
  VoteCause,
  VoteParticipant,
  VoteTeamOfTheWeek,
} from '#/types/voting'

const KIND_LABELS: Record<string, string> = {
  player_of_week: 'Player of the week',
  team_of_week: 'Team of the week',
}

const MODE_LABELS: Record<string, string> = {
  single: 'Single pick',
  slate: 'Slate',
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function label(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return null
  return map[value] ?? value.replaceAll('_', ' ')
}

function formationOf(formation: VoteCause['formation']): Formation | null {
  if (!formation) return null
  if (Array.isArray(formation)) return formation[0] ?? null
  return formation
}

function isTeamSlate(cause: VoteCause) {
  return cause.kind === 'team_of_week' || cause.vote_mode === 'slate'
}

function byVotes(left: VoteParticipant, right: VoteParticipant) {
  return (
    right.total_votes - left.total_votes || left.name.localeCompare(right.name)
  )
}

function positionKey(value: string) {
  return value
    .toLowerCase()
    .replaceAll('centre', 'center')
    .replaceAll('defence', 'defense')
    .replaceAll('offence', 'offense')
    .replace(/[^a-z0-9]/g, '')
}

function groupBySlot(
  participants: VoteParticipant[],
  formation: Formation | null,
  slots: VoteCause['slots'],
  squad: VoteTeamOfTheWeek[],
) {
  const order =
    formation?.positions_order?.map((position) => ({
      slot: position.slot,
      label: position.label,
    })) ??
    (slots ?? []).map((slot) => ({ slot: slot.slot, label: slot.label }))
  const slotByLabel = new Map<string, number>()
  for (const position of order) {
    const key = positionKey(position.label)
    if (key && !slotByLabel.has(key)) slotByLabel.set(key, position.slot)
  }
  const slotByParticipant = new Map<number, number>()
  for (const player of squad) {
    slotByParticipant.set(player.participant_id, player.slot)
  }
  for (const slot of slots ?? []) {
    for (const player of slot.players) {
      if (!slotByParticipant.has(player.participant_id)) {
        slotByParticipant.set(player.participant_id, slot.slot)
      }
    }
  }
  const grouped = new Map<number, VoteParticipant[]>()
  const unassigned: VoteParticipant[] = []

  for (const participant of participants) {
    const named =
      participant.player?.current_position != null
        ? slotByLabel.get(positionKey(participant.player.current_position))
        : undefined
    const slot =
      participant.slot ??
      slotByParticipant.get(participant.id) ??
      named ??
      null
    if (slot == null) {
      unassigned.push(participant)
      continue
    }
    const current = grouped.get(slot) ?? []
    current.push(participant)
    grouped.set(slot, current)
  }

  const seen = new Set<number>()
  const sections: { key: string; label: string; players: VoteParticipant[] }[] =
    []

  for (const position of order) {
    if (seen.has(position.slot)) continue
    seen.add(position.slot)
    sections.push({
      key: String(position.slot),
      label: position.label,
      players: [...(grouped.get(position.slot) ?? [])].sort(byVotes),
    })
  }

  for (const [slot, players] of grouped) {
    if (seen.has(slot) || players.length === 0) continue
    sections.push({
      key: String(slot),
      label: `Slot ${slot}`,
      players: [...players].sort(byVotes),
    })
  }

  if (unassigned.length > 0) {
    sections.push({
      key: 'none',
      label: 'No slot',
      players: [...unassigned].sort(byVotes),
    })
  }

  return sections
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function photoOf(
  imageUrl: string | null | undefined,
  passport: string | null | undefined,
) {
  return imageUrl?.trim() || passport?.trim() || ''
}

export function VoteCauseDetail({ cause }: { cause: VoteCause }) {
  const [query, setQuery] = useState('')
  const [slotKey, setSlotKey] = useState<string | null>(null)
  const participants = cause.participants ?? []
  const squad = cause.team_of_the_week ?? []
  const formation = formationOf(cause.formation)
  const slate = isTeamSlate(cause)
  const votesGathered =
    cause.total_votes ??
    participants.reduce((sum, participant) => sum + participant.total_votes, 0)
  const ballots = cause.ballots_casted ?? 0
  const from = formatDate(cause.date_from)
  const to = formatDate(cause.date_to)
  const kind = label(KIND_LABELS, cause.kind)
  const mode = label(MODE_LABELS, cause.vote_mode)
  const ranked = useMemo(
    () =>
      [...participants].sort(
        (left, right) =>
          right.total_votes - left.total_votes ||
          left.name.localeCompare(right.name),
      ),
    [participants],
  )
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? ranked.filter((participant) =>
        [participant.name, participant.team_name, participant.player?.current_position]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : ranked
  const leaderVotes = ranked[0]?.total_votes ?? 0
  const cards = !slate && ranked.length < 10
  const slotSections = useMemo(
    () =>
      slate
        ? groupBySlot(ranked, formation, cause.slots, cause.team_of_the_week ?? [])
        : [],
    [slate, ranked, formation, cause.slots, cause.team_of_the_week],
  )
  const activeSlotKey = slotSections.some((section) => section.key === slotKey)
    ? slotKey
    : (slotSections[0]?.key ?? null)
  const activeSlot = slotSections.find((section) => section.key === activeSlotKey)
  const slotPlayers = (activeSlot?.players ?? []).filter((participant) =>
    needle
      ? [participant.name, participant.team_name, participant.player?.current_position]
          .join(' ')
          .toLowerCase()
          .includes(needle)
      : true,
  )

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <Link to="/votes" className="text-sm text-muted-foreground hover:text-foreground">
        Votes
      </Link>

      <header className="space-y-3">
        {cause.image_url ? (
          <img
            src={cause.image_url}
            alt=""
            className="h-36 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            {cause.reason?.trim() || 'Vote'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[kind, mode, formation?.name].filter(Boolean).join(' · ')}
            {from || to ? (
              <>
                {(kind || mode || formation) ? <span className="mx-2">·</span> : null}
                {[from, to].filter(Boolean).join(' – ')}
              </>
            ) : null}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Votes gathered" value={votesGathered} />
          <Stat label="Ballots cast" value={ballots} />
          <Stat label="Participants" value={participants.length} />
          {cause.picks_required != null ? (
            <Stat label="Picks" value={cause.picks_required} />
          ) : null}
        </div>
      </header>

      {slate && formation ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-heading">Team of the week</h2>
          <Pitch formation={formation} squad={squad} />
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-heading">
            Participants
            <span className="ml-2 font-normal text-muted-foreground">
              {visible.length}
              {needle ? ` of ${ranked.length}` : ''}
            </span>
          </h2>
          {!cards && ranked.length > 8 ? (
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, team, position"
              aria-label="Search participants"
              className="h-8 w-full max-w-xs text-xs"
            />
          ) : null}
        </div>

        {ranked.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No participants yet.
          </p>
        ) : cards ? (
          <CardBoard
            participants={visible}
            ranked={ranked}
            leaderVotes={leaderVotes}
            votesGathered={votesGathered}
          />
        ) : slate ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Slots">
              {slotSections.map((section) => {
                const selected = section.key === activeSlotKey
                return (
                  <button
                    key={section.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setSlotKey(section.key)}
                    className={cn(
                      'h-8 rounded-md border px-2.5 text-xs',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {section.label}
                    <span className="ml-1.5 tabular-nums opacity-70">
                      {section.players.length}
                    </span>
                  </button>
                )
              })}
            </div>
            {slotPlayers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                {activeSlot?.players.length
                  ? 'No players match in this slot.'
                  : 'No players in this slot.'}
              </p>
            ) : (
              <ol className="overflow-hidden rounded-xl border border-border bg-card">
                {slotPlayers.map((participant, index) => (
                  <ParticipantRow
                    key={participant.id}
                    participant={participant}
                    rank={index + 1}
                    leaderVotes={activeSlot?.players[0]?.total_votes ?? 0}
                    votesGathered={votesGathered}
                  />
                ))}
              </ol>
            )}
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No participants match.
          </p>
        ) : (
          <ol className="overflow-hidden rounded-xl border border-border bg-card">
            {visible.map((participant, index) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                rank={needle ? ranked.indexOf(participant) + 1 : index + 1}
                leaderVotes={leaderVotes}
                votesGathered={votesGathered}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-lg font-semibold text-heading tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function Pitch({
  formation,
  squad,
}: {
  formation: Formation
  squad: VoteTeamOfTheWeek[]
}) {
  const lines = [...formation.rows].reverse()

  return (
    <div className="space-y-8 rounded-xl border border-border bg-emerald-950/30 px-4 py-8 sm:px-8">
      <p className="text-center text-xs text-muted-foreground">
        {formation.name}
        {formation.description ? ` · ${formation.description}` : ''}
      </p>
      <div className="space-y-10">
        {lines.map((line, lineIndex) => (
          <div
            key={line.map((cell) => cell.slot).join('-') || lineIndex}
            className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8"
          >
            {line.map((cell) => (
              <PitchSlot
                key={cell.slot}
                cell={cell}
                player={squad.find((item) => item.slot === cell.slot)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PitchSlot({
  cell,
  player,
}: {
  cell: FormationRow
  player: VoteTeamOfTheWeek | undefined
}) {
  const photo = photoOf(player?.image_url, player?.player?.passportphoto)

  return (
    <div className="flex w-28 flex-col items-center gap-1.5 text-center">
      <span className="text-[10px] font-medium tracking-wide text-emerald-200/80 uppercase">
        {cell.label}
      </span>
      <Avatar className="size-10">
        {photo ? <AvatarImage src={photo} alt="" /> : null}
        <AvatarFallback>
          {player ? initials(player.name) : cell.label}
        </AvatarFallback>
      </Avatar>
      <p className="w-full truncate text-xs font-medium text-heading">
        {player?.name ?? '—'}
      </p>
      <p className="w-full truncate text-[10px] text-muted-foreground">
        {player?.team_name ?? 'Open'}
      </p>
      <p className="text-[10px] text-muted-foreground tabular-nums">
        {player ? `${player.picks} pick${player.picks === 1 ? '' : 's'}` : ''}
      </p>
    </div>
  )
}

function CardBoard({
  participants,
  ranked,
  leaderVotes,
  votesGathered,
}: {
  participants: VoteParticipant[]
  ranked: VoteParticipant[]
  leaderVotes: number
  votesGathered: number
}) {
  const leader = ranked[0]
  const featured =
    leader != null &&
    leader.total_votes > 0 &&
    participants[0]?.id === leader.id
      ? leader
      : null

  return (
    <ol className="space-y-2">
      {participants.map((participant) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          rank={ranked.indexOf(participant) + 1}
          leading={participant.id === featured?.id}
          leaderVotes={leaderVotes}
          votesGathered={votesGathered}
        />
      ))}
    </ol>
  )
}

function ParticipantCard({
  participant,
  rank,
  leading = false,
  leaderVotes,
  votesGathered,
}: {
  participant: VoteParticipant
  rank: number
  leading?: boolean
  leaderVotes: number
  votesGathered: number
}) {
  const photo = photoOf(
    participant.image_url,
    participant.player?.passportphoto,
  )
  const share =
    votesGathered > 0
      ? Math.round((participant.total_votes / votesGathered) * 100)
      : 0
  const bar =
    leaderVotes > 0
      ? Math.max(
          participant.total_votes > 0 ? 4 : 0,
          (participant.total_votes / leaderVotes) * 100,
        )
      : 0
  const position = participant.player?.current_position?.trim()

  return (
    <li
      className={cn(
        'rounded-xl border bg-card px-4 py-3',
        leading ? 'border-emerald-500/80' : 'border-border',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex w-6 shrink-0 justify-center text-sm text-muted-foreground tabular-nums">
          {leading ? (
            <TrophyIcon className="size-4 text-emerald-400" />
          ) : (
            rank
          )}
        </span>
        <Avatar className="size-10">
          {photo ? <AvatarImage src={photo} alt="" /> : null}
          <AvatarFallback>{initials(participant.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {participant.name}
              </p>
              <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                {participant.team_logo ? (
                  <img
                    src={participant.team_logo}
                    alt=""
                    className="size-3.5 shrink-0 rounded-sm object-contain"
                  />
                ) : null}
                <span className="truncate">
                  {[position, participant.team_name].filter(Boolean).join(' · ')}
                </span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  'text-xl font-semibold tabular-nums',
                  leading ? 'text-emerald-400' : 'text-sky-400',
                )}
              >
                {participant.total_votes.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {share}%
              </p>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full',
                bar === 0 && 'w-0',
                leading ? 'bg-emerald-500' : 'bg-sky-500',
              )}
              style={{ width: `${bar}%` }}
            />
          </div>
        </div>
      </div>
    </li>
  )
}

function ParticipantRow({
  participant,
  rank,
  leaderVotes,
  votesGathered,
}: {
  participant: VoteParticipant
  rank: number
  leaderVotes: number
  votesGathered: number
}) {
  const photo = photoOf(
    participant.image_url,
    participant.player?.passportphoto,
  )
  const share =
    votesGathered > 0
      ? Math.round((participant.total_votes / votesGathered) * 100)
      : 0
  const bar =
    leaderVotes > 0
      ? Math.max(participant.total_votes > 0 ? 4 : 0, (participant.total_votes / leaderVotes) * 100)
      : 0
  const position = participant.player?.current_position?.trim()

  return (
    <li className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0">
      <span className="w-10 shrink-0 text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
        {rank}
      </span>
      <Avatar className="size-10">
        {photo ? <AvatarImage src={photo} alt="" /> : null}
        <AvatarFallback>{initials(participant.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading">
          {participant.name}
        </p>
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {participant.team_logo ? (
            <img
              src={participant.team_logo}
              alt=""
              className="size-4 shrink-0 rounded-sm object-contain"
            />
          ) : null}
          <span className="truncate">
            {[position, participant.team_name].filter(Boolean).join(' · ')}
          </span>
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full bg-primary', bar === 0 && 'w-0')}
            style={{ width: `${bar}%` }}
          />
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium text-heading tabular-nums">
          {participant.total_votes.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {share}%
        </p>
      </div>
    </li>
  )
}
