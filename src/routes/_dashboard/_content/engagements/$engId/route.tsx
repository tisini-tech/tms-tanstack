import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { getEngQuestionsFn } from '#/data/engagements'

const TYPE_LABELS: Record<string, string> = {
  SU: 'Survey',
  QZ: 'Quiz',
  PR: 'Predictor',
}

const STATUS_LABELS: Record<string, string> = {
  DR: 'Draft',
  SC: 'Scheduled',
  OP: 'Open',
  LV: 'Live',
  CL: 'Closed',
  MK: 'Marked',
}

const navItems = [
  {
    label: 'Questions',
    to: '/engagements/$engId',
    exact: true,
  },
  {
    label: 'Responses',
    to: '/engagements/$engId/responses',
    exact: true,
  },
  {
    label: 'Leaderboard',
    to: '/engagements/$engId/leaderboard',
    exact: true,
  },
  {
    label: 'Actions',
    to: '/engagements/$engId/actions',
    exact: true,
  },
] as const

function statusClassName(status: string) {
  switch (status) {
    case 'OP':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
    case 'LV':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
    case 'SC':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
    case 'MK':
      return 'bg-violet-500/15 text-violet-700 dark:text-violet-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const Route = createFileRoute('/_dashboard/_content/engagements/$engId')(
  {
    loader: async ({ params: { engId } }) => {
      if (!engId) {
        throw new Error('Engagement ID is required')
      }

      const engagement = await getEngQuestionsFn({ data: { engId } })

      return { engagement }
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { engId } = Route.useParams()
  const { engagement } = Route.useLoaderData()

  const starts = formatDate(engagement?.starts_at)
  const ends = formatDate(engagement?.ends_at)

  const items = navItems.filter((item) => {
    if (item.to === '/engagements/$engId/leaderboard') {
      return engagement?.type === 'PR' || engagement?.type === 'QZ'
    }

    if (item.to === '/engagements/$engId/actions') {
      return engagement?.is_responses_editable === true
    }

    return true
  })

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
      <section className="shrink-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-2 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-heading">
              {engagement?.title || 'Engagement'}
            </h1>
            {engagement?.status ? (
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                  statusClassName(engagement.status),
                )}
              >
                {STATUS_LABELS[engagement.status] ?? engagement.status}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {[
              TYPE_LABELS[engagement?.type ?? ''] ?? engagement?.type,
              starts && ends ? `${starts} – ${ends}` : starts || ends,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap border-t border-border">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              params={{ engId }}
              activeOptions={{ exact: item.exact }}
              className="min-w-36 flex-1 border-l border-border px-4 py-3 text-center text-sm font-medium transition-colors first:border-l-0"
              activeProps={{
                className: 'bg-muted/50 text-foreground',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:bg-muted/30 hover:text-foreground',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
