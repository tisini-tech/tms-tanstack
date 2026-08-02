import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/super-agent/fixtures/$fixId/raw-events',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/super-agent/fixtures/$fixId/raw-events"!</div>
}
