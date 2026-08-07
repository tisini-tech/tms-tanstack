import { useEffect, useState, type ReactNode } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import {
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import type { ArticleCategory, Author } from '#/lib/types'
import {
  ARTICLE_EXCERPT_MAX_CHARS,
  type ArticleFormValues,
} from '#/lib/schemas'
import { CreateCategoryModal } from '#/components/articles/create-category'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'
import { UploadButton } from '#/lib/uploadthing'

const comboboxTriggerClassName = cn(
  'flex h-9 w-full items-center justify-between gap-1.5 rounded-xl border border-transparent bg-input/50 px-3 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  'data-placeholder:text-muted-foreground',
)

const comboboxPopupClassName = cn(
  'flex max-h-(--available-height) w-(--anchor-width) min-w-[220px] flex-col origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5',
  'dark:ring-foreground/10',
  'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
  'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
)

const comboboxItemClassName = cn(
  'relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
)

type FieldMeta = {
  errors: Array<unknown>
  isTouched: boolean
  isValid: boolean
}

type FormFieldApi<T = unknown> = {
  name: string
  state: {
    value: T
    meta: FieldMeta
  }
  handleChange: (value: T | ((prev: T) => T)) => void
  handleBlur: () => void
}

function fieldErrorMessage(field: {
  state: { meta: { errors: Array<unknown> } }
}) {
  const first = field.state.meta.errors[0]
  if (!first) return null
  if (typeof first === 'string') return first
  if (typeof first === 'object' && first && 'message' in first) {
    return String((first as { message?: unknown }).message ?? '')
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
  mode,
  authors = [],
  categories,
  authorField,
  categoryField,
  keywordsField,
  excerptField,
  accessTypeField,
  statusField,
  featuredImageField,
}: {
  mode: 'create' | 'edit'
  authors?: Author[]
  categories: ArticleCategory[]
  authorField?: FormFieldApi<string>
  categoryField: FormFieldApi<ArticleFormValues['categoryId']>
  keywordsField: FormFieldApi<ArticleFormValues['keywords']>
  excerptField: FormFieldApi<ArticleFormValues['excerpt']>
  accessTypeField: FormFieldApi<ArticleFormValues['accessType']>
  statusField?: FormFieldApi<'draft' | 'published'>
  featuredImageField: FormFieldApi<ArticleFormValues['featuredImage']>
}) {
  const [categoryOptions, setCategoryOptions] = useState(categories)

  useEffect(() => {
    setCategoryOptions(categories)
  }, [categories])

  const selectedCategory =
    categoryOptions.find(
      (category) => String(category.id) === categoryField.state.value,
    ) ?? null
  const selectedAuthor =
    authors.find((author) => String(author.id) === authorField?.state.value) ??
    null
  const authorError = authorField ? fieldErrorMessage(authorField) : null
  const categoryError = fieldErrorMessage(categoryField)
  const featuredImageError = fieldErrorMessage(featuredImageField)
  const keywordsError = fieldErrorMessage(keywordsField)
  const excerptError = fieldErrorMessage(excerptField)
  const excerptLength = excerptField.state.value.length

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-heading">Post</p>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="More">
          <MoreHorizontalIcon />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MetaPanel title="Access">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Access type</span>
              <button
                type="button"
                className="font-medium text-foreground underline-offset-2 hover:underline"
                onClick={() =>
                  accessTypeField.handleChange(
                    accessTypeField.state.value === 'FREE'
                      ? 'SUBSCRIPTION'
                      : 'FREE',
                  )
                }
              >
                {accessTypeField.state.value}
              </button>
            </div>
            {mode === 'edit' && statusField ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                  {statusField.state.value}
                </span>
              </div>
            ) : null}
          </div>
        </MetaPanel>

        {mode === 'edit' && authorField ? (
          <MetaPanel title="Author">
            <Label htmlFor="article-author" className="sr-only">
              Author
            </Label>
            <Combobox.Root
              value={selectedAuthor}
              onValueChange={(author) => {
                authorField.handleChange(author ? String(author.id) : '')
                authorField.handleBlur()
              }}
              items={authors}
              itemToStringLabel={(item) => item?.display_name ?? ''}
              isItemEqualToValue={(a, b) => a?.id === b?.id}
            >
              <Combobox.Trigger
                id="article-author"
                aria-label="Author"
                className={comboboxTriggerClassName}
              >
                <Combobox.Value placeholder="Select author" />
                <Combobox.Icon
                  render={
                    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  }
                />
              </Combobox.Trigger>

              <Combobox.Portal>
                <Combobox.Positioner
                  className="isolate z-50"
                  sideOffset={4}
                  align="start"
                >
                  <Combobox.Popup className={comboboxPopupClassName}>
                    <div className="border-b border-border/60 p-2">
                      <Combobox.Input
                        placeholder="Search authors…"
                        className={cn(
                          'h-8 w-full rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                          'placeholder:text-muted-foreground',
                          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                        )}
                      />
                    </div>
                    <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No authors found
                    </Combobox.Empty>
                    <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                      {(author: Author) => (
                        <Combobox.Item
                          key={author.id}
                          value={author}
                          className={comboboxItemClassName}
                        >
                          <Combobox.ItemIndicator
                            render={
                              <span className="absolute right-2 flex size-4 items-center justify-center" />
                            }
                          >
                            <CheckIcon className="size-4" />
                          </Combobox.ItemIndicator>
                          {author.display_name}
                        </Combobox.Item>
                      )}
                    </Combobox.List>
                  </Combobox.Popup>
                </Combobox.Positioner>
              </Combobox.Portal>
            </Combobox.Root>
            {authorError ? (
              <p className="text-xs text-destructive">{authorError}</p>
            ) : null}
          </MetaPanel>
        ) : null}

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
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const url = res[0]?.ufsUrl ?? null
                featuredImageField.handleChange(url)
              }}
              onUploadError={(error: Error) => {
                console.error(error)
              }}
            />
          )}
          {featuredImageError ? (
            <p className="mt-2 text-xs text-destructive">{featuredImageError}</p>
          ) : null}
        </MetaPanel>

        <MetaPanel title="Category">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Combobox.Root
                value={selectedCategory}
                onValueChange={(category) => {
                  categoryField.handleChange(
                    category ? String(category.id) : '',
                  )
                  categoryField.handleBlur()
                }}
                items={categoryOptions}
                itemToStringLabel={(item) => item?.name ?? ''}
                isItemEqualToValue={(a, b) => a?.id === b?.id}
              >
                <Combobox.Trigger
                  aria-label="Category"
                  className={comboboxTriggerClassName}
                >
                  <Combobox.Value placeholder="Select category" />
                  <Combobox.Icon
                    render={
                      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                    }
                  />
                </Combobox.Trigger>

                <Combobox.Portal>
                  <Combobox.Positioner
                    className="isolate z-50"
                    sideOffset={4}
                    align="start"
                  >
                    <Combobox.Popup className={comboboxPopupClassName}>
                      <div className="border-b border-border/60 p-2">
                        <Combobox.Input
                          placeholder="Search categories…"
                          className={cn(
                            'h-8 w-full rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                            'placeholder:text-muted-foreground',
                            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                          )}
                        />
                      </div>
                      <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {categoryOptions.length === 0
                          ? 'No categories yet'
                          : 'No categories found'}
                      </Combobox.Empty>
                      <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                        {(category: ArticleCategory) => (
                          <Combobox.Item
                            key={category.id}
                            value={category}
                            className={comboboxItemClassName}
                          >
                            <Combobox.ItemIndicator
                              render={
                                <span className="absolute right-2 flex size-4 items-center justify-center" />
                              }
                            >
                              <CheckIcon className="size-4" />
                            </Combobox.ItemIndicator>
                            {category.name}
                          </Combobox.Item>
                        )}
                      </Combobox.List>
                    </Combobox.Popup>
                  </Combobox.Positioner>
                </Combobox.Portal>
              </Combobox.Root>
            </div>

            <CreateCategoryModal
              onCreated={(category) => {
                setCategoryOptions((prev) => {
                  if (prev.some((item) => item.id === category.id)) return prev
                  return [...prev, category]
                })
                categoryField.handleChange(String(category.id))
                categoryField.handleBlur()
              }}
            />
          </div>
          {categoryError ? (
            <p className="text-xs text-destructive">{categoryError}</p>
          ) : null}
        </MetaPanel>

        <MetaPanel title="Keywords">
          <Input
            placeholder="Add keywords…"
            className="bg-background"
            value={keywordsField.state.value}
            onChange={(e) => keywordsField.handleChange(e.target.value)}
            onBlur={keywordsField.handleBlur}
          />
          <p className="text-xs text-muted-foreground">
            Separate keywords with commas
          </p>
          {keywordsError ? (
            <p className="text-xs text-destructive">{keywordsError}</p>
          ) : null}
        </MetaPanel>

        <MetaPanel title="Excerpt">
          <Textarea
            placeholder="Write a short excerpt…"
            className="min-h-24 resize-none bg-background"
            value={excerptField.state.value}
            maxLength={ARTICLE_EXCERPT_MAX_CHARS}
            onChange={(e) => excerptField.handleChange(e.target.value)}
            onBlur={excerptField.handleBlur}
          />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Shown in archives and search results</span>
            <span
              className={
                excerptLength > ARTICLE_EXCERPT_MAX_CHARS
                  ? 'text-destructive'
                  : undefined
              }
            >
              {excerptLength}/{ARTICLE_EXCERPT_MAX_CHARS}
            </span>
          </div>
          {excerptError ? (
            <p className="text-xs text-destructive">{excerptError}</p>
          ) : null}
        </MetaPanel>
      </div>
    </aside>
  )
}

export function ArticleEditorHeader({
  mode,
  title,
  isSubmitting,
  canModerate,
  onSaveDraft,
  onUpdate,
  onPublish,
  onReject,
}: {
  mode: 'create' | 'edit'
  title?: string
  isSubmitting?: boolean
  canModerate: boolean
  onSaveDraft?: () => void
  onUpdate?: () => void
  onPublish: () => void
  onReject?: () => void
}) {
  const heading =
    mode === 'edit'
      ? title
        ? `Edit: ${title}`
        : 'Edit article'
      : 'New post'

  return (
    <header className="z-20 shrink-0 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-3 py-2.5 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator
            orientation="vertical"
            className="hidden h-4 sm:block data-[orientation=vertical]:h-4"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-heading">{heading}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Draft autosaved
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden shrink-0 sm:inline-flex"
          >
            Preview
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>

          {mode === 'create' ? (
            <>
              <Button
                type="button"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={isSubmitting}
                onClick={onSaveDraft}
              >
                Save draft
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={isSubmitting || !canModerate}
                title={
                  canModerate
                    ? undefined
                    : 'Only editors can publish articles'
                }
                onClick={onPublish}
              >
                Publish
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={isSubmitting}
                onClick={onUpdate}
              >
                Update
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={isSubmitting || !canModerate}
                title={
                  canModerate
                    ? undefined
                    : 'Only editors can publish articles'
                }
                onClick={onPublish}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                disabled={isSubmitting || !canModerate}
                title={
                  canModerate
                    ? undefined
                    : 'Only editors can reject articles'
                }
                onClick={onReject}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function ArticleTitleFields({
  mode,
  titleField,
  slugField,
}: {
  mode: 'create' | 'edit'
  titleField: FormFieldApi<ArticleFormValues['title']>
  slugField?: FormFieldApi<string>
}) {
  const titleError = fieldErrorMessage(titleField)
  const slugError = slugField ? fieldErrorMessage(slugField) : null

  return (
    <div className="space-y-2 border-b border-border bg-card px-4 py-4 sm:space-y-3 sm:px-5 sm:py-5 md:px-8">
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
        className="w-full border-0 bg-transparent font-heading text-2xl font-semibold tracking-tight text-heading outline-none placeholder:text-muted-foreground/70 sm:text-3xl md:text-4xl"
      />
      {titleError ? (
        <p className="text-sm text-destructive">{titleError}</p>
      ) : null}

      {mode === 'edit' && slugField ? (
        <>
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
              className="h-7 w-full max-w-48 rounded-md bg-muted/40 px-2 text-sm"
            />
          </div>
          {slugError ? (
            <p className="text-sm text-destructive">{slugError}</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
