import { VoteCauseDetail } from '#/components/votes/cause-detail'
import { voteCauseByIdQueryOptions } from '#/data/votes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/votes/$voteId/')({
  loader: async ({ context, params }) => {
    const causeId = params.voteId

    if (!causeId) {
      throw new Error('Cause ID is required')
    }

    const cause = await context.queryClient.ensureQueryData(
      voteCauseByIdQueryOptions(causeId),
    )

    return { cause }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { cause } = Route.useLoaderData()

  if (!cause) {
    return (
      <p className="px-2 py-10 text-center text-sm text-muted-foreground">
        This vote could not be loaded.
      </p>
    )
  }

  return <VoteCauseDetail cause={cause} />
}
