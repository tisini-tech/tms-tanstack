import { ArrowLeftIcon } from 'lucide-react'
import { Link, Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { getInitials } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Loading } from '#/components/general/errors/loading'
import { competitionQueryOptions } from '#/data/competitions'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

const navItems = [
  {
    label: 'Seasons',
    to: '/competitions/$compId',
    exact: true,
  },
  {
    label: 'Divisions',
    to: '/competitions/$compId/divisions',
    exact: true,
  },
  {
    label: 'Images',
    to: '/competitions/$compId/images',
    exact: true,
  },
] as const

export const Route = createFileRoute(
  '/_dashboard/competitions/_competitions/$compId',
)({
  loader: async ({ context, params }) => {
    const competitions = await context.queryClient.ensureQueryData(
      competitionQueryOptions,
    )
    const competition = competitions.find(
      (entry) => entry.id === Number(params.compId),
    )
    if (!competition) {
      throw notFound()
    }
    return { competition }
  },
  component: CompetitionLayout,
  pendingComponent: Loading,
})

function CompetitionLayout() {
  const { competition } = Route.useLoaderData()
  const { compId } = Route.useParams()
  const hasLogo = Boolean(competition.logo?.trim())
  const active = competition.status === 1

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/competitions" />}
        >
          <ArrowLeftIcon className="size-4" data-icon="inline-start" />
          Back to competitions
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
          <Avatar size="lg" className="size-16 rounded-xl after:rounded-xl">
            {hasLogo ? (
              <AvatarImage
                src={competition.logo}
                alt={competition.name}
                className="rounded-xl"
              />
            ) : null}
            <AvatarFallback className="rounded-xl text-sm font-medium">
              {getInitials(competition.name) || 'CP'}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-heading">
                {competition.name}
              </h1>
              <span
                className={
                  active
                    ? 'rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                    : 'rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground'
                }
              >
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {competition.country?.name || 'Unknown country'}
              {competition.country?.iso_code2
                ? ` · ${competition.country.iso_code2}`
                : ''}
              {' · '}
              id {competition.id}
            </p>
            {competition.description?.trim() ? (
              <p className="pt-1 text-sm text-muted-foreground">
                {competition.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-border">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              params={{ compId }}
              activeOptions={{ exact: item.exact }}
              className="border-l border-border px-4 py-3 text-center text-sm font-medium transition-colors first:border-l-0"
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

      <Outlet />
    </div>
  )
}
