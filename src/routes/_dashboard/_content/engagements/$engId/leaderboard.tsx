import { createFileRoute } from '@tanstack/react-router'

import type { EngLeaderboard } from '#/lib/types'
import { getEngLeaderboardFn } from '#/data/engagements'

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/leaderboard',
)({
  loader: async ({ params: { engId } }) => {
    if (!engId) {
      throw new Error('Engagement ID is required')
    }

    const leaderboard = await getEngLeaderboardFn({ data: { engId } })

    return { leaderboard }
  },
  component: RouteComponent,
})

function formatTime(seconds: number | null | undefined) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '—'
  const total = Number(seconds)
  if (total < 60) return `${total.toFixed(1)}s`
  const minutes = Math.floor(total / 60)
  const remainder = Math.round(total % 60)
  return `${minutes}m ${remainder}s`
}

function RouteComponent() {
  const { leaderboard } = Route.useLoaderData() ?? {}
  const rows = [...(leaderboard ?? [])].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score
    return (
      (left.time_used ?? Number.POSITIVE_INFINITY) -
      (right.time_used ?? Number.POSITIVE_INFINITY)
    )
  })

  if (!rows.length) {
    return (
      <p className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No leaderboard entries yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <th className="w-16 px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 text-right font-medium">Score</th>
            <th className="px-4 py-3 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, index) => (
            <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LeaderboardRow({
  entry,
  rank,
}: {
  entry: EngLeaderboard
  rank: number
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 tabular-nums text-muted-foreground">{rank}</td>
      <td className="px-4 py-3 font-medium text-heading">
        {entry.user?.username || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-right font-medium tabular-nums">
        {entry.score}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
        {formatTime(entry.time_used)}
      </td>
    </tr>
  )
}
