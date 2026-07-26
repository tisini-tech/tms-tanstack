import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/competitions/')({
  component: CompetitionsPage,
})

function CompetitionsPage() {
  return <main>Competitions Home</main>
}
