import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/competitions/$compId/leagues/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/competitions/leagues/"!</div>
}
