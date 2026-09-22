import type { DashboardMatch } from '#/lib/types'
import { cn } from '#/lib/utils'

/** Parse "Round 12 (R)" / "R12 (R)" into round label + reschedule flag. */
export function parseMatchRound(match: DashboardMatch) {
  const raw =
    match.matchday?.trim() ||
    match.label?.match(/Round\s+\d+(?:\s*\(R\))?/i)?.[0] ||
    `M${match.match_id}`

  const rescheduled = /\(\s*R\s*\)/i.test(raw)
  const round =
    raw
      .replace(/\(\s*R\s*\)/gi, '')
      .replace(/^Round\s+/i, 'R')
      .trim() || `M${match.match_id}`

  return { round, rescheduled }
}

export function roundSortKey(match: DashboardMatch) {
  const { round } = parseMatchRound(match)
  const n = Number.parseInt(round.replace(/\D/g, ''), 10)
  return Number.isFinite(n) ? n : match.match_id
}

export function sortMatchesByRound(matches: DashboardMatch[]) {
  return [...matches].sort((a, b) => {
    const roundDiff = roundSortKey(a) - roundSortKey(b)
    if (roundDiff !== 0) return roundDiff
    return new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
  })
}

export function MatchRoundHeader({
  match,
  className,
}: {
  match: DashboardMatch
  className?: string
}) {
  const { round, rescheduled } = parseMatchRound(match)

  return (
    <span
      className={cn(
        'flex flex-col items-center justify-center leading-tight',
        className,
      )}
    >
      <span>{round}</span>
      {rescheduled ? (
        <span className="text-[9px] font-medium text-muted-foreground/40">
          (R)
        </span>
      ) : null}
    </span>
  )
}
