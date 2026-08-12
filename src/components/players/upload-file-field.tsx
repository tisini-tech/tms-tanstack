import { useRef, useState } from 'react'
import { Loader2Icon, UploadIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { uploadFiles } from '#/lib/uploadthing'

const MAX_FILE_SIZE = 4 * 1024 * 1024

function isPdfUrl(url: string) {
  return /\.pdf(?:$|\?)/i.test(url)
}

function isAllowedDocumentFile(file: File) {
  return (
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    /\.pdf$/i.test(file.name)
  )
}

export function UploadFileField({
  id,
  label,
  value,
  onChange,
  onUploadingChange,
  preview = 'image',
}: {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
  preview?: 'image' | 'document'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accept = preview === 'document' ? 'image/*,application/pdf,.pdf' : 'image/*'

  async function handleFile(file: File | undefined) {
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('File must be 4MB or smaller')
      return
    }

    if (preview === 'document' && !isAllowedDocumentFile(file)) {
      setError('Upload an image or PDF')
      return
    }

    if (preview === 'image' && !file.type.startsWith('image/')) {
      setError('Upload an image')
      return
    }

    setError(null)
    setUploading(true)
    onUploadingChange?.(true)

    try {
      const result = await uploadFiles('imageUploader', { files: [file] })
      const url = result[0]?.ufsUrl
      if (!url) throw new Error('Upload failed')
      onChange(url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Upload failed')
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      {value ? (
        !isPdfUrl(value) ? (
          <img
            src={value}
            alt=""
            className={
              preview === 'image'
                ? 'size-24 rounded-xl object-cover ring-1 ring-border'
                : 'max-h-32 w-full rounded-xl object-contain ring-1 ring-border'
            }
          />
        ) : (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs text-primary underline-offset-2 hover:underline"
          >
            PDF uploaded — open preview
          </a>
        )
      ) : null}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <UploadIcon className="size-4" />
          )}
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => onChange('')}
          >
            Remove
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </Field>
  )
}
