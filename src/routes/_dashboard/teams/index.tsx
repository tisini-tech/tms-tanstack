import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  return <main>Teams Home</main>
}
