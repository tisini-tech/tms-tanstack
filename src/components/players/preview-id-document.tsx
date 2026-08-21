import { useEffect, useState } from 'react'
import { EyeIcon, FileTextIcon, Loader2Icon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { isPdfDocument, looksLikePdfUrl } from '#/lib/document-url'
import {
  ID_DOCUMENT_TYPE_LABELS,
  parseIdDocumentType,
  type Player,
} from '#/lib/types'

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

        <DocumentPreview
          url={documentUrl}
          alt={`${name} ${label}`}
          className="h-[min(75vh,44rem)]"
        />
      </DialogContent>
    </Dialog>
  )
}

export function DocumentPreview({
  url,
  alt,
  className,
  compact = false,
}: {
  url: string
  alt: string
  className?: string
  compact?: boolean
}) {
  const [kind, setKind] = useState<'loading' | 'pdf' | 'image'>(() =>
    looksLikePdfUrl(url) ? 'pdf' : 'loading',
  )

  useEffect(() => {
    let cancelled = false

    if (looksLikePdfUrl(url)) {
      setKind('pdf')
      return
    }

    setKind('loading')
    void isPdfDocument(url).then((isPdf) => {
      if (!cancelled) setKind(isPdf ? 'pdf' : 'image')
    })

    return () => {
      cancelled = true
    }
  }, [url])

  if (kind === 'loading') {
    return (
      <div
        className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground ${className ?? ''}`}
      >
        <Loader2Icon className="size-4 animate-spin" />
        Checking document…
      </div>
    )
  }

  if (kind === 'pdf') {
    return (
      <div
        className={`overflow-hidden rounded-xl border border-border bg-muted/30 ${className ?? ''}`}
      >
        <iframe
          title={alt}
          src={url}
          className={
            compact
              ? 'h-40 w-full bg-background'
              : 'h-[min(75vh,44rem)] w-full bg-background'
          }
        />
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            PDF document
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-muted/30 ${className ?? ''}`}
    >
      <img
        src={url}
        alt={alt}
        onError={() => setKind('pdf')}
        className={
          compact
            ? 'mx-auto max-h-40 w-full object-contain'
            : 'mx-auto max-h-[min(75vh,44rem)] w-full object-contain'
        }
      />
    </div>
  )
}
