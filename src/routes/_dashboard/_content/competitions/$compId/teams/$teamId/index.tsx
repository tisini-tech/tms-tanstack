import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/competitions/$compId/teams/$teamId/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/_dashboard/competitions/teams/$teamId/"!</div>
}
