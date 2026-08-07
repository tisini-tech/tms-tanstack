import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/competitions/players/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/competitions/players/"!</div>
}
