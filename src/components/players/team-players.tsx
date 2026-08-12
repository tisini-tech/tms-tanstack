import { useMemo, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { Link } from '@tanstack/react-router'
import {
  CheckIcon,
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react'

import type { Team, TeamPlayer } from '#/lib/types'
import { cn, getInitials } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { DeletePlayerDialog } from '#/components/players/delete-player'
import { PreviewIdDocumentModal } from '#/components/players/preview-id-document'

interface TeamPlayersProps {
  teams: Team[]
  players: TeamPlayer[]
  selectedTeam: Team | null
  isLoading?: boolean
  onTeamChange: (team: Team | null) => void
}

export function TeamPlayers({
  teams,
  players,
  selectedTeam,
  isLoading = false,
  onTeamChange,
}: TeamPlayersProps) {
  const [query, setQuery] = useState('')

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return players

    return players.filter((entry) => {
      const player = entry.player
      const haystack = [
        player.name,
        player.current_position,
        player.nationality,
        player.preferred_foot,
        player.id_no,
        String(entry.current_jersey_no || ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [players, query])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Players
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedTeam
              ? `${filteredPlayers.length}${
                  query.trim() ? ` of ${players.length}` : ''
                } player${filteredPlayers.length === 1 ? '' : 's'} in ${selectedTeam.name}`
              : 'Select a team to view its squad'}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            disabled={!selectedTeam}
            title={!selectedTeam ? 'Select a team first' : undefined}
            nativeButton={!!selectedTeam ? false : undefined}
            render={
              selectedTeam ? (
                <Link
                  to="/competitions/players/create"
                  search={{ teamId: selectedTeam.id }}
                />
              ) : (
                <button type="button" />
              )
            }
          >
            <PlusIcon className="size-4" data-icon="inline-start" />
            Add player
          </Button>

          <div className="relative w-full sm:w-[240px]">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search players…"
              aria-label="Search players"
              disabled={!selectedTeam || isLoading}
              className="h-9 rounded-xl bg-input/50 pl-9"
            />
          </div>

          <Combobox.Root
            value={selectedTeam}
            onValueChange={(team) => {
              setQuery('')
              onTeamChange(team)
            }}
            items={teams}
            itemToStringLabel={(item) => item?.name ?? ''}
            isItemEqualToValue={(a, b) => a?.id === b?.id}
          >
            <Combobox.Trigger
              aria-label="Team"
              className={cn(
                'flex h-9 w-full items-center justify-between gap-1.5 rounded-xl border border-transparent bg-input/50 px-3 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none sm:w-[260px]',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                'data-placeholder:text-muted-foreground',
              )}
            >
              <Combobox.Value placeholder="Select a team" />
              <Combobox.Icon
                render={
                  <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                }
              />
            </Combobox.Trigger>

            <Combobox.Portal>
              <Combobox.Positioner
                className="isolate z-50"
                sideOffset={4}
                align="end"
              >
                <Combobox.Popup
                  className={cn(
                    'flex max-h-(--available-height) w-(--anchor-width) min-w-[260px] flex-col origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5',
                    'dark:ring-foreground/10',
                    'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
                    'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
                  )}
                >
                  <div className="border-b border-border/60 p-2">
                    <Combobox.Input
                      placeholder="Search teams…"
                      className={cn(
                        'h-8 w-full rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                        'placeholder:text-muted-foreground',
                        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                      )}
                    />
                  </div>
                  <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {teams.length === 0 ? 'No teams yet' : 'No teams found'}
                  </Combobox.Empty>
                  <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                    {(team: Team) => (
                      <Combobox.Item
                        key={team.id}
                        value={team}
                        className={cn(
                          'relative flex min-h-8 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
                          'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
                        )}
                      >
                        <Combobox.ItemIndicator
                          render={
                            <span className="absolute right-2 flex size-4 items-center justify-center" />
                          }
                        >
                          <CheckIcon className="size-4" />
                        </Combobox.ItemIndicator>
                        {team.name}
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : !selectedTeam ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Choose a team to load its players.
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No players found for {selectedTeam.name}.
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No players match “{query.trim()}”.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlayers.map((entry) => (
            <PlayerCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerCard({ entry }: { entry: TeamPlayer }) {
  const player = entry.player
  const hasPhoto = Boolean(player.passportphoto?.trim())
  const name = player.name || 'Unknown player'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Avatar size="lg" className="size-14 after:rounded-full">
        {hasPhoto ? (
          <AvatarImage src={player.passportphoto} alt={name} />
        ) : null}
        <AvatarFallback className="text-xs font-medium">
          {getInitials(name) || 'PL'}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-foreground">{name}</p>
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            #{entry.current_jersey_no || '—'}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {player.current_position || 'Unlisted position'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[player.nationality, player.preferred_foot]
            .filter(Boolean)
            .join(' · ') || '—'}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <PreviewIdDocumentModal player={player} />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Edit ${name}`}
          title="Edit player"
          nativeButton={false}
          render={
            <Link
              to="/competitions/players/$playerId/edit"
              params={{ playerId: String(entry.id) }}
              search={{ teamId: entry.team }}
            />
          }
        >
          <PencilIcon className="size-4" />
        </Button>
        <DeletePlayerDialog entry={entry} />
      </div>
    </div>
  )
}
