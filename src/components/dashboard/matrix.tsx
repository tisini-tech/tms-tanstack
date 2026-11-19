import { useState, useMemo } from 'react'
import { cn } from '#/lib/utils'
import type { MatrixDashboard, SimpleFixture } from '#/lib/types'
import { getCompetitionsFn } from '#/data/competitions'

type MatrixSort = {
  key: 'name' | 'made' | 'received'
  direction: 'asc' | 'desc'
}

type CountMatrix = Record<string, Record<string, number>>

export function PassMatrixGrid({ matrix }: { matrix: CountMatrix }) {
  const [sort, setSort] = useState<MatrixSort>({
    key: 'name',
    direction: 'asc',
  })
  const names = useMemo(() => matrixPlayers(matrix), [matrix])
  const made = useMemo(() => rowTotals(matrix, names), [matrix, names])
  const received = useMemo(() => columnTotals(matrix, names), [matrix, names])
  const players = useMemo(
    () => sortPlayers(names, made, received, sort),
    [names, made, received, sort],
  )
  if (players.length === 0) {
    return <p className="text-sm text-muted-foreground">No passes recorded.</p>
  }

  const leaders = topCombinations(matrix)
  const peak = leaders[0]?.count ?? 1
  const leadPassers = new Set(leaders.map((pair) => pair.passer))
  const leadReceivers = new Set(leaders.map((pair) => pair.receiver))
  const grand = [...made.values()].reduce((sum, count) => sum + count, 0)

  function toggleSort(key: MatrixSort['key']) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'desc' ? 'asc' : 'desc' }
        : { key, direction: key === 'name' ? 'asc' : 'desc' },
    )
  }

  const columns = `5rem repeat(${players.length + 1}, minmax(0, 1fr))`

  return (
    <div
      className="grid w-full min-w-0 text-[11px] leading-none"
      style={{ gridTemplateColumns: columns }}
    >
      <div className="sticky top-0 left-0 z-30 flex h-16 items-end border-r border-b border-border bg-card px-1.5 pb-1">
        <SortButton
          label="Passer"
          active={sort.key === 'name'}
          direction={sort.direction}
          onClick={() => toggleSort('name')}
        />
      </div>
      {players.map((player) => (
        <div
          key={player}
          title={player}
          className={cn(
            'sticky top-0 z-20 flex h-16 min-w-0 items-center justify-center overflow-hidden border-r border-b border-border bg-card',
            leadReceivers.has(player)
              ? 'text-foreground ring-1 ring-primary/60 ring-inset'
              : 'text-muted-foreground',
          )}
        >
          <span className="max-h-14 truncate [writing-mode:vertical-rl] rotate-180">
            {player}
          </span>
        </div>
      ))}
      <div className="sticky top-0 right-0 z-30 flex h-16 items-end justify-center border-b border-border bg-card pb-1">
        <SortButton
          label="Made"
          active={sort.key === 'made'}
          direction={sort.direction}
          onClick={() => toggleSort('made')}
        />
      </div>

      {players.flatMap((passer) => [
        <div
          key={`${passer}-name`}
          title={passer}
          className={cn(
            'sticky left-0 z-10 flex h-6 min-w-0 items-center truncate border-r border-b border-border bg-card px-1.5 font-medium text-foreground',
            leadPassers.has(passer) && 'ring-1 ring-primary/60 ring-inset',
          )}
        >
          {passer}
        </div>,
        ...players.map((receiver) => {
          const same = passer === receiver
          const count = matrix[passer]?.[receiver] ?? 0
          const leadCell = !same && count > 0 && count === peak
          return (
            <div
              key={`${passer}-${receiver}`}
              className={cn(
                'flex h-6 min-w-0 items-center justify-center overflow-hidden border-r border-b border-border tabular-nums',
                leadCell && 'font-semibold ring-1 ring-primary ring-inset',
              )}
              style={
                same
                  ? undefined
                  : {
                      background: `color-mix(in oklch, var(--primary) ${Math.round((count / peak) * 55)}%, transparent)`,
                    }
              }
            >
              {same ? '—' : count || ''}
            </div>
          )
        }),
        <div
          key={`${passer}-made`}
          className="sticky right-0 z-10 flex h-6 min-w-0 items-center justify-center overflow-hidden border-b border-border bg-card font-medium tabular-nums"
        >
          {made.get(passer) ?? 0}
        </div>,
      ])}

      <div className="sticky bottom-0 left-0 z-30 flex h-6 items-center border-r border-border bg-card px-1.5 shadow-[0_-1px_0_0_var(--border)]">
        <SortButton
          label="Received"
          active={sort.key === 'received'}
          direction={sort.direction}
          onClick={() => toggleSort('received')}
        />
      </div>
      {players.map((player) => (
        <div
          key={`${player}-received`}
          className="sticky bottom-0 z-20 flex h-6 min-w-0 items-center justify-center overflow-hidden border-r border-border bg-card font-medium tabular-nums shadow-[0_-1px_0_0_var(--border)]"
        >
          {received.get(player) ?? 0}
        </div>
      ))}
      <div className="sticky right-0 bottom-0 z-30 flex h-6 items-center justify-center overflow-hidden border-border bg-card font-medium tabular-nums shadow-[0_-1px_0_0_var(--border)]">
        {grand}
      </div>
    </div>
  )
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string
  active: boolean
  direction: MatrixSort['direction']
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      {active ? (
        <span aria-hidden>{direction === 'asc' ? '↑' : '↓'}</span>
      ) : null}
    </button>
  )
}

export function topCombinations(matrix: CountMatrix) {
  let peak = 0
  const pairs: { passer: string; receiver: string; count: number }[] = []
  for (const [passer, receivers] of Object.entries(matrix)) {
    for (const [receiver, count] of Object.entries(receivers ?? {})) {
      if (passer === receiver || count <= 0) continue
      if (count > peak) {
        peak = count
        pairs.length = 0
      }
      if (count === peak) pairs.push({ passer, receiver, count })
    }
  }
  return pairs
}

export function sumMatrices(
  matches: MatrixDashboard[],
  selectedIds: Set<number>,
) {
  const total: CountMatrix = {}
  for (const match of matches) {
    if (!selectedIds.has(match.fixture.id)) continue
    for (const [passer, receivers] of Object.entries(match.pass_matrix ?? {})) {
      const row = (total[passer] ??= {})
      for (const [receiver, count] of Object.entries(receivers ?? {})) {
        row[receiver] = (row[receiver] ?? 0) + passCount(count)
      }
    }
  }
  return total
}

function passCount(value: number | string) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function matrixPlayers(matrix: CountMatrix) {
  const names = new Set<string>()
  for (const [passer, receivers] of Object.entries(matrix)) {
    names.add(passer)
    for (const receiver of Object.keys(receivers ?? {})) names.add(receiver)
  }
  return [...names]
}

function rowTotals(matrix: CountMatrix, players: string[]) {
  const totals = new Map<string, number>()
  for (const passer of players) {
    let total = 0
    for (const receiver of players) {
      if (receiver === passer) continue
      total += matrix[passer]?.[receiver] ?? 0
    }
    totals.set(passer, total)
  }
  return totals
}

function columnTotals(matrix: CountMatrix, players: string[]) {
  const totals = new Map<string, number>()
  for (const receiver of players) {
    let total = 0
    for (const passer of players) {
      if (passer === receiver) continue
      total += matrix[passer]?.[receiver] ?? 0
    }
    totals.set(receiver, total)
  }
  return totals
}

function sortPlayers(
  players: string[],
  made: Map<string, number>,
  received: Map<string, number>,
  sort: MatrixSort,
) {
  const direction = sort.direction === 'asc' ? 1 : -1
  return [...players].sort((left, right) => {
    const delta =
      sort.key === 'made'
        ? (made.get(left) ?? 0) - (made.get(right) ?? 0)
        : sort.key === 'received'
          ? (received.get(left) ?? 0) - (received.get(right) ?? 0)
          : left.localeCompare(right)
    return delta * direction || left.localeCompare(right)
  })
}

export async function categoryNameFor(
  compId: string,
  categoryId: number | undefined,
) {
  if (categoryId == null) return ''
  const competitions = await getCompetitionsFn()
  return (
    competitions
      .find((competition) => String(competition.id) === compId)
      ?.categories.find((category) => category.id === categoryId)?.name ?? ''
  )
}
