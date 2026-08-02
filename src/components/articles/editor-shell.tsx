import { useState, type ReactNode } from 'react'
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  ImageIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import type { ArticleSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'

export const ARTICLE_AUTHORS = [
  { id: '1', name: 'JJ Maina' },
  { id: '2', name: 'Nostus Simiyu' },
  { id: '3', name: 'Guest Writer' },
] as const

export const ARTICLE_CATEGORIES = [
  { id: 'news', name: 'News' },
  { id: 'match-reports', name: 'Match reports' },
  { id: 'transfers', name: 'Transfers' },
  { id: 'opinion', name: 'Opinion' },
] as const

type FieldMeta = {
  errors: Array<unknown>
  isTouched: boolean
  isValid: boolean
}

type FormFieldApi<T> = {
  name: string
  state: {
    value: T
    meta: FieldMeta
  }
  handleChange: (value: T | ((prev: T) => T)) => void
  handleBlur: () => void
}

function fieldErrorMessage(field: { state: { meta: { errors: Array<unknown> } } }) {
  const first = field.state.meta.errors[0]
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && first && 'message' in first) {
    return String((first as { message?: string }).message ?? '')
  }
  return null
}

function MetaPanel({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-heading"
      >
        {title}
        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open ? 'rotate-0' : '-rotate-90',
          )}
        />
      </button>
      {open ? <div className="space-y-3 px-4 pb-4">{children}</div> : null}
    </section>
  )
}

export function ArticleEditorSidebar({
  authorField,
  categoryField,
  tagsField,
  excerptField,
  visibilityField,
  statusField,
  featuredImageField,
}: {
  authorField: FormFieldApi<ArticleSchema['authorId']>
  categoryField: FormFieldApi<ArticleSchema['categoryIds']>
  tagsField: FormFieldApi<ArticleSchema['tags']>
  excerptField: FormFieldApi<ArticleSchema['excerpt']>
  visibilityField: FormFieldApi<ArticleSchema['visibility']>
  statusField: FormFieldApi<ArticleSchema['status']>
  featuredImageField: FormFieldApi<ArticleSchema['featuredImage']>
}) {
  const selectedAuthor = ARTICLE_AUTHORS.find(
    (author) => author.id === authorField.state.value,
  )
  const authorError = fieldErrorMessage(authorField)

  const toggleCategory = (categoryId: string) => {
    const current = categoryField.state.value
    categoryField.handleChange(
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-heading">Post</p>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
          <MoreHorizontalIcon />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MetaPanel title="Status & visibility">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Visibility</span>
              <button
                type="button"
                className="font-medium text-foreground capitalize underline-offset-2 hover:underline"
                onClick={() =>
                  visibilityField.handleChange(
                    visibilityField.state.value === 'public'
                      ? 'private'
                      : 'public',
                  )
                }
              >
                {visibilityField.state.value}
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Publish</span>
              <span className="font-medium text-foreground">Immediately</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {statusField.state.value}
              </span>
            </div>
          </div>
        </MetaPanel>

        <MetaPanel title="Author">
          <Label htmlFor="article-author" className="sr-only">
            Author
          </Label>
          <Select
            value={authorField.state.value || null}
            onValueChange={(value) => {
              if (value) authorField.handleChange(value)
            }}
          >
            <SelectTrigger
              id="article-author"
              className="w-full bg-background"
              onBlur={authorField.handleBlur}
            >
              <SelectValue placeholder="Select author">
                {selectedAuthor?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ARTICLE_AUTHORS.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {authorError ? (
            <p className="text-xs text-destructive">{authorError}</p>
          ) : null}
        </MetaPanel>

        <MetaPanel title="Featured image">
          {featuredImageField.state.value ? (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                <img
                  src={featuredImageField.state.value}
                  alt="Featured"
                  className="aspect-video w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => featuredImageField.handleChange(null)}
              >
                Remove featured image
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50"
              onClick={() =>
                featuredImageField.handleChange(
                  'https://placehold.co/1200x630/png?text=Featured+image',
                )
              }
            >
              <ImageIcon className="size-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Set featured image
              </span>
              <span className="text-xs text-muted-foreground">
                Recommended 1200×630
              </span>
            </button>
          )}
        </MetaPanel>

        <MetaPanel title="Categories">
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            {ARTICLE_CATEGORIES.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-border accent-primary"
                  checked={categoryField.state.value.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  onBlur={categoryField.handleBlur}
                />
                {category.name}
              </label>
            ))}
          </div>
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            + Add new category
          </button>
        </MetaPanel>

        <MetaPanel title="Tags">
          <Input
            placeholder="Add tags…"
            className="bg-background"
            value={tagsField.state.value}
            onChange={(e) => tagsField.handleChange(e.target.value)}
            onBlur={tagsField.handleBlur}
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas
          </p>
        </MetaPanel>

        <MetaPanel title="Excerpt" defaultOpen={false}>
          <Textarea
            placeholder="Write an excerpt (optional)"
            className="min-h-24 resize-none bg-background"
            value={excerptField.state.value}
            onChange={(e) => excerptField.handleChange(e.target.value)}
            onBlur={excerptField.handleBlur}
          />
          <p className="text-xs text-muted-foreground">
            Shown in archives and search results
          </p>
        </MetaPanel>
      </div>
    </aside>
  )
}

export function ArticleEditorHeader({
  isSubmitting,
  onSaveDraft,
}: {
  isSubmitting?: boolean
  onSaveDraft: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate text-sm font-medium text-heading">
            Add New Post
          </p>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Draft autosaved
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            Preview
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={onSaveDraft}
          >
            Save draft
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            Publish
          </Button>
        </div>
      </div>
    </header>
  )
}

export function ArticleTitleFields({
  titleField,
  slugField,
}: {
  titleField: FormFieldApi<ArticleSchema['title']>
  slugField: FormFieldApi<ArticleSchema['slug']>
}) {
  const titleError = fieldErrorMessage(titleField)
  const slugError = fieldErrorMessage(slugField)

  return (
    <div className="space-y-3 border-b border-border bg-card px-5 py-5 md:px-8">
      <Label htmlFor="article-title" className="sr-only">
        Title
      </Label>
      <input
        id="article-title"
        name={titleField.name}
        placeholder="Add title"
        value={titleField.state.value}
        onChange={(e) => titleField.handleChange(e.target.value)}
        onBlur={titleField.handleBlur}
        className="w-full border-0 bg-transparent font-heading text-3xl font-semibold tracking-tight text-heading outline-none placeholder:text-muted-foreground/70 md:text-4xl"
      />
      {titleError ? (
        <p className="text-sm text-destructive">{titleError}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span>Permalink:</span>
        <span className="truncate text-foreground/80">
          https://tisini.africa/articles/
        </span>
        <Label htmlFor="article-slug" className="sr-only">
          Slug
        </Label>
        <Input
          id="article-slug"
          name={slugField.name}
          placeholder="post-slug"
          value={slugField.state.value}
          onChange={(e) => slugField.handleChange(e.target.value)}
          onBlur={slugField.handleBlur}
          className="h-7 w-48 rounded-md bg-muted/40 px-2 text-sm"
        />
      </div>
      {slugError ? (
        <p className="text-sm text-destructive">{slugError}</p>
      ) : null}
    </div>
  )
}
