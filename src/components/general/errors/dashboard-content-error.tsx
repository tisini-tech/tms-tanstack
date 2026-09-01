import { useRouteContext, useRouter } from '@tanstack/react-router'
import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { ErrorPageProps } from '#/components/general/errors/error'
import {
  ErrorPageGoBackButton,
  ErrorPageHomeButton,
  useErrorPageHomePath,
} from '#/components/general/errors/error-page-nav'

export const DashboardContentError = ({ error, reset }: ErrorPageProps) => {
  const router = useRouter()
  const { modules } = useRouteContext({ from: '/_dashboard' })
  const homePath = useErrorPageHomePath(modules)
  const message = error instanceof Error ? error.message : null

  const retry = () => {
    reset?.()
    void router.invalidate()
  }

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-6" aria-hidden />
        </span>

        <p className="mt-6 font-heading text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Something went wrong
        </p>

        <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Our numbers slipped
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          This page failed to load. Try again in a moment — if it keeps
          happening, our team is already looking into it.
        </p>

        {import.meta.env.DEV && message ? (
          <pre className="mt-6 w-full max-w-md overflow-x-auto rounded-xl border border-border bg-muted/60 p-4 text-left font-mono text-xs whitespace-pre-wrap text-muted-foreground">
            {message}
          </pre>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={retry}
            className="h-11 gap-2 rounded-xl px-5"
          >
            <RotateCcwIcon className="size-4" aria-hidden />
            Try again
          </Button>

          <ErrorPageHomeButton homePath={homePath} />
          <ErrorPageGoBackButton />
        </div>
      </div>
    </div>
  )
}
