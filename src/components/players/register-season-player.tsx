import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon, UserPlusIcon } from 'lucide-react'

import { UploadFileField } from '#/components/players/upload-file-field'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { addSeasonPlayerFn } from '#/data/players'
import type { TeamPlayer } from '#/lib/types'

export function RegisterSeasonPlayerDialog({
  entry,
  seasonId,
}: {
  entry: TeamPlayer
  seasonId: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [frontImg, setFrontImg] = useState('')
  const [sideImg, setSideImg] = useState('')
  const [actionImg, setActionImg] = useState('')

  const name = entry.player.name || 'this player'
  const isUploading = uploadingCount > 0

  function handleUploadingChange(uploading: boolean) {
    setUploadingCount((count) => count + (uploading ? 1 : -1))
  }

  function resetForm() {
    setError(null)
    setFrontImg('')
    setSideImg('')
    setActionImg('')
    setUploadingCount(0)
  }

  async function handleRegister() {
    setError(null)
    setIsLoading(true)
    try {
      await addSeasonPlayerFn({
        data: {
          teamId: String(entry.team),
          teamPlayerId: entry.id,
          seasonId,
          ...(frontImg.trim() ? { frontImg: frontImg.trim() } : {}),
          ...(sideImg.trim() ? { sideImg: sideImg.trim() } : {}),
          ...(actionImg.trim() ? { actionImg: actionImg.trim() } : {}),
        },
      })
      await router.invalidate()
      setOpen(false)
      resetForm()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to register player for this season',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Register ${name} for season`}
            title="Register for season"
          />
        }
      >
        <UserPlusIcon className="size-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register for season</DialogTitle>
          <DialogDescription>
            Register <span className="font-medium text-foreground">{name}</span>{' '}
            for the selected season. Season photos are optional and upload to
            storage before registration.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-3">
          <UploadFileField
            id={`season-front-${entry.id}`}
            label="Front image"
            value={frontImg}
            onChange={setFrontImg}
            onUploadingChange={handleUploadingChange}
          />
          <UploadFileField
            id={`season-side-${entry.id}`}
            label="Side image"
            value={sideImg}
            onChange={setSideImg}
            onUploadingChange={handleUploadingChange}
          />
          <UploadFileField
            id={`season-action-${entry.id}`}
            label="Action image"
            value={actionImg}
            onChange={setActionImg}
            onUploadingChange={handleUploadingChange}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isUploading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading || isUploading}
            onClick={() => {
              void handleRegister()
            }}
          >
            {isLoading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Registering…
              </>
            ) : isUploading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Uploading…
              </>
            ) : (
              'Register player'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
