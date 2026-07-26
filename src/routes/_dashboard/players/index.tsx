import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/players/')({
  component: PlayersPage,
})

function PlayersPage() {
  return <main>Players Home</main>
}
