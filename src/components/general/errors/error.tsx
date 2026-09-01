import { Link, useRouter } from '@tanstack/react-router'
import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  ErrorPageGoBackButton,
  ErrorPageHomeButton,
  useErrorPageHomePath,
} from '#/components/general/errors/error-page-nav'

export type ErrorPageProps = {
  error?: unknown
  reset?: () => void
}

export const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  const router = useRouter()
  const homePath = useErrorPageHomePath()
  const message = error instanceof Error ? error.message : null

  const retry = () => {
    reset?.()
    void router.invalidate()
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_145_/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.32_0.05_260_/0.35),transparent_50%)]"
      />

      <header className="relative z-10 px-6 py-5 md:px-10">
        <Link to={homePath} className="inline-flex items-center">
          <img
            src="/tisini.png"
            alt="Tisini"
            className="h-9 w-auto object-contain dark:invert"
          />
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
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

          <p className="mt-12 text-xs text-muted-foreground">
            Inspiring African lives using numbers.
          </p>
        </div>
      </main>
    </div>
  )
}
