import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon, PlusIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { UploadDropzone } from '#/lib/uploadthing'
import { createCompetitionImageFn } from '#/data/competitions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'

type AddCompImagesModalProps = Readonly<{
  competitionId: string
  seasonId: string | null
  divisionId?: string | null
}>

export function AddCompImagesModal({
  competitionId,
  seasonId,
  divisionId,
}: AddCompImagesModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canUpload = Boolean(competitionId && seasonId)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            aria-label="Add images"
            title="Add images"
            disabled={!canUpload}
          />
        }
      >
        <PlusIcon className="size-4" />
        Add images
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add images</DialogTitle>
          <DialogDescription>
            Upload to storage first, then we save the URLs for this season
            {divisionId ? ' and division' : ''}.
          </DialogDescription>
        </DialogHeader>

        {!canUpload ? (
          <p className="text-sm text-muted-foreground">
            Select a season before uploading images.
          </p>
        ) : saving ? (
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-8 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Saving images…
          </div>
        ) : (
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={async (files) => {
              if (!seasonId) return

              const urls = files
                .map((file) => file.ufsUrl)
                .filter((url): url is string => Boolean(url))

              if (urls.length === 0) {
                setError('Upload finished but no image URLs were returned')
                return
              }

              setSaving(true)
              setError(null)

              try {
                await createCompetitionImageFn({
                  data: {
                    competitionId,
                    seasonId,
                    ...(divisionId ? { divisionId } : {}),
                    images: urls.map((image_url) => ({
                      image_url,
                      caption: '',
                    })),
                  },
                })
                await router.invalidate()
                setOpen(false)
              } catch (caught) {
                setError(
                  caught instanceof Error
                    ? caught.message
                    : 'Failed to save images',
                )
              } finally {
                setSaving(false)
              }
            }}
            onUploadError={(caught) => {
              setError(caught.message || 'Upload failed')
            }}
          />
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </DialogContent>
    </Dialog>
  )
}
