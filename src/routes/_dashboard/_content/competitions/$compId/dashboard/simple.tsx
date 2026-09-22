import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/dashboard/simple',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_dashboard/_content/competitions/$compId/dashboard/simple"!
    </div>
  )
}
