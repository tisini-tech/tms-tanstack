import { Link } from '@tanstack/react-router'
import {
  GraduationCapIcon,
  SparklesIcon,
  TrophyIcon,
} from 'lucide-react'

import {
  ErrorPageNavButtons,
  useErrorPageHomePath,
} from '#/components/general/errors/error-page-nav'

const pillars = [
  { icon: TrophyIcon, label: 'Sports' },
  { icon: GraduationCapIcon, label: 'Education' },
  { icon: SparklesIcon, label: 'Engagement' },
]

export const NotFound = () => {
  const homePath = useErrorPageHomePath()

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
            There are still plenty of numbers worth exploring.
          </p>

          <ErrorPageNavButtons homePath={homePath} />

          <div className="mt-12 flex flex-col items-center gap-4">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {pillars.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              Inspiring African lives using numbers.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
