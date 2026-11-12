import { useMemo, useState } from 'react'
import { Loader2Icon, XIcon } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { createLineup } from '#/data/collection'
import { Checkbox } from '#/components/ui/checkbox'
import type { CreateLineupPayload, FixtureType, TeamPlayer } from '#/lib/types'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'

type CreateLineupModalProps = {
  title: string
  players: TeamPlayer[]
  matchType: FixtureType | undefined
  fixId: number
}

function isGoalkeeper(position: string | null | undefined) {
  return position?.trim().toLowerCase() === 'goalkeeper'
}

function lineupPayload(
  selected: TeamPlayer[],
  starters: number,
): CreateLineupPayload[] {
  return selected.map((entry, index) => {
    const starter = index < starters
    return {
      team_id: entry.team,
      player_id: entry.player.id,
      team_player_id: entry.id,
      role: starter ? 'first11' : 'sub',
      lineup_position: starter ? index + 1 : 1000,
      jersey_number: entry.current_jersey_no,
      is_goalkeeper: isGoalkeeper(entry.player.current_position),
    }
  })
}

export default function CreateLineupModal({
  title,
  players,
  matchType,
  fixId,
}: CreateLineupModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const required = matchType?.no_player ?? 0

  const selected = useMemo(() => {
    const byId = new Map(players.map((entry) => [entry.id, entry]))
    return selectedIds.flatMap((id) => {
      const entry = byId.get(id)
      return entry ? [entry] : []
    })
  }, [players, selectedIds])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return players
    return players.filter((entry) => {
      const name = entry.player.name.toLowerCase()
      const jersey = String(entry.current_jersey_no)
      return name.includes(query) || jersey.includes(query)
    })
  }, [players, search])

  const starterCount = Math.min(selected.length, required)
  const subCount = Math.max(0, selected.length - required)
  const canSave = required > 0 && subCount >= 1 && !saving

  function toggle(id: number, on: boolean) {
    setSelectedIds((current) => {
      if (on) return current.includes(id) ? current : [...current, id]
      return current.filter((item) => item !== id)
    })
  }

  function reset() {
    setSearch('')
    setSelectedIds([])
    setError(null)
  }

  async function save() {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await createLineup({
        data: {
          fixId,
          lineups: lineupPayload(selected, required),
        },
      })
      await router.invalidate()
      setOpen(false)
      reset()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Failed to save lineup',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button variant="outline" aria-label={title} />}>
        {title}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Input
            value={search}
            placeholder="Search players"
            onChange={(event) => setSearch(event.target.value)}
            className={search ? 'pr-8' : undefined}
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => setSearch('')}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>

        <div className="scrollbar-thin -mx-1 max-h-72 overflow-x-hidden overflow-y-auto px-1">
          {visible.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No players match that search.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {visible.map((entry) => {
                const order = selectedIds.indexOf(entry.id)
                const place =
                  order === -1
                    ? null
                    : order < required
                      ? String(order + 1)
                      : 'Sub'
                return (
                  <li key={entry.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60">
                      <Checkbox
                        checked={order !== -1}
                        onCheckedChange={(value) =>
                          toggle(entry.id, value === true)
                        }
                      />
                      <span className="w-8 shrink-0 tabular-nums text-muted-foreground">
                        {entry.current_jersey_no}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {entry.player.name}
                      </span>
                      {place ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {place}
                        </span>
                      ) : null}
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {required > 0
            ? `${starterCount} of ${required} starters · ${subCount} sub${subCount === 1 ? '' : 's'}. At least 1 sub is required.`
            : 'This match type has no starting lineup size.'}
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button type="button" disabled={!canSave} onClick={() => void save()}>
            {saving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              'Save lineup'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
