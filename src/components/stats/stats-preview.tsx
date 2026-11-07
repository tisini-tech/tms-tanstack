import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type { PlayerStats } from '#/lib/types'

export type StatsPreviewPlayer = {
  name: string
  teamName: string
  jerseyNumber: number
  stats: PlayerStats[]
}

type StatsPreviewProps = {
  player: StatsPreviewPlayer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StatsPreview({ player, open, onOpenChange }: StatsPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{player?.name ?? 'Stats'}</DialogTitle>
          {player ? (
            <DialogDescription>
              {player.teamName} · #{player.jerseyNumber}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="scrollbar-thin max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden rounded-lg border border-border [scrollbar-gutter:stable]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Sub-event</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {player && player.stats.length > 0 ? (
                player.stats.map((event) => (
                  <EventRows key={event.event_id} event={event} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No raw stats for this player.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventRows({ event }: { event: PlayerStats }) {
  return (
    <>
      <tr className="border-t border-border">
        <td className="px-3 py-2 font-medium">{event.event_name}</td>
        <td className="px-3 py-2 text-muted-foreground">—</td>
        <td className="px-3 py-2 text-right tabular-nums">{event.total}</td>
      </tr>
      {event.sub_events.map((sub) => (
        <tr
          key={sub.sub_event_id}
          className="border-t border-border bg-muted/30"
        >
          <td className="px-3 py-2">
            <span className="inline-block size-3 translate-y-0.5 rounded-bl border-b border-l border-muted-foreground/60" />
          </td>
          <td className="px-3 py-2">{sub.sub_event_name}</td>
          <td className="px-3 py-2 text-right tabular-nums">{sub.total}</td>
        </tr>
      ))}
    </>
  )
}
