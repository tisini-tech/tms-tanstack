import { createFileRoute, getRouteApi } from '@tanstack/react-router'

const competitionRoute = getRouteApi(
  '/_dashboard/competitions/_competitions/$compId',
)

export const Route = createFileRoute(
  '/_dashboard/competitions/_competitions/$compId/divisions',
)({
  component: DivisionsTab,
})

function DivisionsTab() {
  const { competition } = competitionRoute.useLoaderData()

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-medium text-heading">Divisions</h2>
      {competition.divisions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No divisions</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {competition.divisions.map((division) => (
            <li
              key={division.id}
              className="rounded-lg bg-muted px-2.5 py-1 text-sm text-foreground"
            >
              {division.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
