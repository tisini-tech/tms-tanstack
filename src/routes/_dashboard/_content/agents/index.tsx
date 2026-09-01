import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/agents/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/agent/"!</div>
}
