import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
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
import { deletePlayerFn } from '#/data/players'
import type { TeamPlayer } from '#/lib/types'

export function DeletePlayerDialog({ entry }: { entry: TeamPlayer }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = entry.player.name || 'this player'

  async function handleDelete() {
    setError(null)
    setIsLoading(true)
    try {
      await deletePlayerFn({
        data: {
          teamId: String(entry.team),
          playerId: String(entry.id),
        },
      })
      await router.invalidate()
      setOpen(false)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Failed to delete player',
      )
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
            variant="outline"
            size="icon-sm"
            aria-label={`Delete ${name}`}
            title="Delete player"
          />
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove player?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <span className="font-medium">{name}</span> from
            the team. This action cannot be undone.
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
                Removing…
              </>
            ) : (
              'Remove player'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
