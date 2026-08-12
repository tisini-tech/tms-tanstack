import { EyeIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  ID_DOCUMENT_TYPE_LABELS,
  parseIdDocumentType,
  type Player,
} from '#/lib/types'

function isPdfUrl(url: string) {
  return /\.pdf(?:$|\?)/i.test(url)
}

export function PreviewIdDocumentModal({ player }: { player: Player }) {
  const documentUrl = player.id_document?.trim()
  if (!documentUrl) return null

  const documentType = parseIdDocumentType(player.id_document_type)
  const label = documentType
    ? ID_DOCUMENT_TYPE_LABELS[documentType]
    : 'ID document'
  const name = player.name || 'player'

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Preview ${label}`}
            title="Preview ID document"
          />
        }
      >
        <EyeIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {label}
            {player.id_no ? ` · ${player.id_no}` : ''}
          </DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
          {isPdfUrl(documentUrl) ? (
            <iframe
              title={`${name} ${label}`}
              src={documentUrl}
              className="h-[min(75vh,44rem)] w-full bg-background"
            />
          ) : (
            <img
              src={documentUrl}
              alt={`${name} ${label}`}
              className="mx-auto max-h-[min(75vh,44rem)] w-full object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
