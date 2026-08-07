import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/core'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouteContext } from '@tanstack/react-router'

import {
  ArticleEditorHeader,
  ArticleEditorSidebar,
  ArticleTitleFields,
} from '#/components/articles/editor-shell'
import { SimpleEditor } from '#/components/tiptap-templates/simple/simple-editor'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  createArticleFn,
  updateArticleStatusFn,
  updateArticleFn,
} from '#/data/articles'
import { canModerateArticles } from '#/lib/article-permissions'
import {
  getArticleFormSchema,
  toCreateArticlePayload,
  toUpdateArticlePayload,
  type ArticleFormValues,
} from '#/lib/schemas'
import type { ArticleCategory, Author } from '#/lib/types'
import { rememberLastModulePath } from '#/lib/last-module'

export type ArticleEditorMode = 'create' | 'edit'
type SubmitIntent = 'draft' | 'update' | 'publish' | 'reject'

interface ArticleEditorFormProps {
  articleId?: string
  mode: ArticleEditorMode
  categories: ArticleCategory[]
  authors?: Author[]
  initialValues: ArticleFormValues
  initialContent?: string
  headingTitle?: string
}

function collectValidationMessages(
  fieldMeta: Partial<Record<string, { errors?: Array<unknown> } | undefined>>,
): string[] {
  const messages: string[] = []

  for (const meta of Object.values(fieldMeta)) {
    if (!meta?.errors?.length) continue
    for (const error of meta.errors) {
      if (!error) continue
      if (typeof error === 'string') {
        messages.push(error)
        continue
      }
      if (typeof error === 'object' && 'message' in error) {
        const message = String((error as { message?: unknown }).message ?? '')
        if (message) messages.push(message)
      }
    }
  }

  return [...new Set(messages)]
}

export function ArticleEditorForm({
  articleId,
  mode,
  categories,
  authors = [],
  initialValues,
  initialContent,
  headingTitle,
}: ArticleEditorFormProps) {
  const navigate = useNavigate()
  const { role } = useRouteContext({ from: '/_dashboard' })
  const canModerate = canModerateArticles(role)

  const [editor, setEditor] = useState<Editor | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)

  const submitIntent = useRef<SubmitIntent>(
    mode === 'create' ? 'draft' : 'update',
  )
  const rejectReasonRef = useRef('')
  const contentApplied = useRef(false)

  useEffect(() => {
    rememberLastModulePath('/articles')
  }, [])

  useEffect(() => {
    if (!editor || contentApplied.current || !initialContent) return
    editor.commands.setContent(initialContent)
    contentApplied.current = true
  }, [editor, initialContent])

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: getArticleFormSchema(mode) as never,
    },
    onSubmitInvalid: ({ formApi }) => {
      const messages = collectValidationMessages(formApi.state.fieldMeta)
      console.warn('article form invalid', { mode, messages })
      document.getElementById('article-title')?.focus()
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const content = editor?.getHTML() ?? ''
      const intent = submitIntent.current

      try {
        if (mode === 'create') {
          const payload = toCreateArticlePayload(value, content)
          const created = await createArticleFn({ data: payload })

          if (intent === 'publish') {
            if (!canModerate) {
              throw new Error('You do not have permission to publish articles')
            }
            await updateArticleStatusFn({
              data: { id: String(created.id), action: 'publish' },
            })
          }

          await navigate({ to: '/articles', replace: true })
          return
        }

        if (!articleId) {
          throw new Error('Missing article id')
        }

        if (intent === 'reject') {
          if (!canModerate) {
            throw new Error('You do not have permission to reject articles')
          }
          const reason = rejectReasonRef.current.trim()
          if (!reason) {
            throw new Error('Rejection reason is required')
          }
          await updateArticleStatusFn({
            data: { id: articleId, action: 'reject', reason },
          })
          await navigate({ to: '/articles', replace: true })
          return
        }

        // Always persist latest fields before publish / update
        const payload = toUpdateArticlePayload(value, content, articleId)
        await updateArticleFn({ data: payload })

        if (intent === 'publish') {
          if (!canModerate) {
            throw new Error('You do not have permission to publish articles')
          }
          await updateArticleStatusFn({
            data: { id: articleId, action: 'publish' },
          })
        }

        await navigate({ to: '/articles', replace: true })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to save article',
        )
      }
    },
  })

  const runSubmit = (intent: SubmitIntent) => {
    submitIntent.current = intent
    void form.handleSubmit()
  }

  const confirmReject = () => {
    const reason = rejectReason.trim()
    if (!reason) {
      setRejectError('Please provide a rejection reason')
      return
    }
    setRejectError(null)
    rejectReasonRef.current = reason
    setRejectOpen(false)
    runSubmit('reject')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/40 lg:overflow-hidden">
      <form
        className="flex min-h-0 flex-1 flex-col lg:overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <ArticleEditorHeader
              mode={mode}
              title={headingTitle}
              isSubmitting={isSubmitting}
              canModerate={canModerate}
              onSaveDraft={() => runSubmit('draft')}
              onUpdate={() => runSubmit('update')}
              onPublish={() => runSubmit('publish')}
              onReject={() => {
                setRejectReason('')
                setRejectError(null)
                setRejectOpen(true)
              }}
            />
          )}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => ({
            fieldMeta: state.fieldMeta,
            submissionAttempts: state.submissionAttempts,
          })}
        >
          {({ fieldMeta, submissionAttempts }) => {
            if (!submissionAttempts) return null

            const messages = collectValidationMessages(fieldMeta)
            if (messages.length === 0) return null

            return (
              <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                <p className="font-medium">
                  Fix the following before continuing:
                </p>
                <ul className="mt-1 list-inside list-disc">
                  {messages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )
          }}
        </form.Subscribe>

        {submitError ? (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-3 p-3 pb-8 sm:gap-4 sm:p-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_280px] lg:overflow-hidden lg:pb-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="flex min-h-[65svh] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:min-h-0 lg:flex-1">
            <div className="shrink-0">
              <form.Field name="title">
                {(titleField) =>
                  mode === 'edit' ? (
                    <form.Field name="slug">
                      {(slugField) => (
                        <ArticleTitleFields
                          mode={mode}
                          titleField={titleField as never}
                          slugField={slugField as never}
                        />
                      )}
                    </form.Field>
                  ) : (
                    <ArticleTitleFields
                      mode={mode}
                      titleField={titleField as never}
                    />
                  )
                }
              </form.Field>
            </div>

            <div className="min-h-[45svh] flex-1 overflow-hidden border-t border-border lg:min-h-0">
              <SimpleEditor embedded onEditorReady={setEditor} />
            </div>
          </main>

          <div className="min-h-0 overflow-visible lg:overflow-hidden lg:self-stretch">
            <form.Field name="categoryId">
              {(categoryField) => (
                <form.Field name="keywords">
                  {(keywordsField) => (
                    <form.Field name="excerpt">
                      {(excerptField) => (
                        <form.Field name="accessType">
                          {(accessTypeField) => (
                            <form.Field name="featuredImage">
                              {(featuredImageField) =>
                                mode === 'edit' ? (
                                  <form.Field name="authorId">
                                    {(authorField) => (
                                      <form.Field name="status">
                                        {(statusField) => (
                                          <ArticleEditorSidebar
                                            mode={mode}
                                            authors={authors}
                                            categories={categories}
                                            authorField={authorField as never}
                                            categoryField={
                                              categoryField as never
                                            }
                                            keywordsField={
                                              keywordsField as never
                                            }
                                            excerptField={excerptField as never}
                                            accessTypeField={
                                              accessTypeField as never
                                            }
                                            statusField={statusField as never}
                                            featuredImageField={
                                              featuredImageField as never
                                            }
                                          />
                                        )}
                                      </form.Field>
                                    )}
                                  </form.Field>
                                ) : (
                                  <ArticleEditorSidebar
                                    mode={mode}
                                    categories={categories}
                                    categoryField={categoryField as never}
                                    keywordsField={keywordsField as never}
                                    excerptField={excerptField as never}
                                    accessTypeField={accessTypeField as never}
                                    featuredImageField={
                                      featuredImageField as never
                                    }
                                  />
                                )
                              }
                            </form.Field>
                          )}
                        </form.Field>
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Field>
          </div>
        </div>
      </form>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject article</DialogTitle>
            <DialogDescription>
              Tell the author why this article is being rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value)
                if (rejectError) setRejectError(null)
              }}
              placeholder="Explain what needs to change…"
              rows={4}
              autoFocus
            />
            {rejectError ? (
              <p className="text-sm text-destructive">{rejectError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmReject}>
              Reject article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
