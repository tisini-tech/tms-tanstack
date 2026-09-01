import { useRouteContext } from '@tanstack/react-router'

import {
  ErrorPageNavButtons,
  useErrorPageHomePath,
} from '#/components/general/errors/error-page-nav'

export const DashboardContentNotFound = () => {
  const { modules } = useRouteContext({ from: '/_dashboard' })
  const homePath = useErrorPageHomePath(modules)

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
        <p className="font-heading text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase">
          Error 404
        </p>

        <p className="mt-4 font-heading text-7xl font-black tracking-tighter tabular-nums text-foreground/90 sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          This page doesn&apos;t add up
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          The link you followed may be broken, or the page may have moved.
        </p>

        <ErrorPageNavButtons homePath={homePath} />
      </div>
    </div>
  )
}
