import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, Trash2Icon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { toast } from '#/components/ui/toast'
import { deleteFixtureEventFn } from '#/data/fixtures'
import { rawEventsQuery } from '#/lib/raw-events-queries'
import type { RawFixtureEvent } from '#/lib/types'

const rawEventsRoute = getRouteApi(
  '/_dashboard/competitions/fixtures/$fixId/raw-events',
)

export function DeleteEventDialog({ event }: { event: RawFixtureEvent }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { fixId } = rawEventsRoute.useParams()

  const eventLabel = [event.metric?.name, event.metric_detail?.name]
    .filter(Boolean)
    .join(' - ')
  const playerLabel = event.player?.name ?? 'team event'

  async function handleDelete() {
    setError(null)
    setIsLoading(true)
    try {
      const message = await deleteFixtureEventFn({
        data: {
          fixtureId: fixId,
          eventId: event.id,
        },
      })

      await queryClient.invalidateQueries({
        queryKey: rawEventsQuery(fixId).queryKey,
      })

      toast.add({
        title: 'Event deleted',
        description: message || 'Match event removed successfully.',
      })
      setOpen(false)
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Failed to delete event'
      setError(message)
      toast.add({
        title: 'Delete failed',
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Delete event"
            title="Delete event"
          />
        }
      >
        <Trash2Icon className="h-4 w-4 text-destructive" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            <span className="font-medium">{eventLabel || 'this event'}</span> by{' '}
            <span className="font-medium">{playerLabel}</span>, minute{' '}
            {event.minute}:{event.second} and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={() => {
              void handleDelete()
            }}
          >
            {isLoading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Deleting…
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
