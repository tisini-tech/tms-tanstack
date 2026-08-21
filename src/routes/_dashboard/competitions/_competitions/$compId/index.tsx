import { createFileRoute, getRouteApi } from '@tanstack/react-router'

const competitionRoute = getRouteApi(
  '/_dashboard/competitions/_competitions/$compId',
)

export const Route = createFileRoute(
  '/_dashboard/competitions/_competitions/$compId/',
)({
  component: SeasonsTab,
})

function SeasonsTab() {
  const { competition } = competitionRoute.useLoaderData()

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-medium text-heading">Seasons</h2>
      {competition.seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No seasons</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {competition.seasons.map((season) => (
            <li
              key={season.id}
              className="rounded-lg bg-muted px-2.5 py-1 text-sm tabular-nums text-foreground"
            >
              {season.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
