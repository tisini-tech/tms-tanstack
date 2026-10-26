import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon, TrashIcon } from 'lucide-react'

import { deleteAuthorFn } from '#/data/articles'
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
import type { Author } from '#/lib/types'

export default function DeleteAuthorButton({ author }: { author: Author }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function removeAuthor() {
    setDeleting(true)
    setError(null)
    try {
      await deleteAuthorFn({ data: { authorId: author.id } })
      await router.invalidate()
      setOpen(false)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Failed to delete author',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setError(null)
      }}
    >
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <TrashIcon className="size-4 text-[#b12b2b] hover:text-[#b12b2b]/80" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this author?</AlertDialogTitle>
          <AlertDialogDescription>
            This deactivates {author.display_name || 'this author'}. The profile
            stays on record but is no longer active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={() => void removeAuthor()}
          >
            {deleting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              'Delete author'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
