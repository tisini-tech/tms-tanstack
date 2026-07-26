import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/super-agent/competitions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/super-agent/competitions/"!</div>
}
