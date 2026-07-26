import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/agents/fixtures')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/agent/fixtures"!</div>
}
