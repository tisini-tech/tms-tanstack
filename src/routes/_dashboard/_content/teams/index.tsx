import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  return <main>Teams Home</main>
}
