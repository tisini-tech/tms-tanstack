import EventCardReview from '#/components/fixtures/review/review-event'
import { ReviewCommentsList } from '#/components/fixtures/review/review-comments-list'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { getReviewCommentsFn } from '#/data/fixtures'

const fixIdRoute = getRouteApi('/_dashboard/super-agent/fixtures/$fixId')

export const Route = createFileRoute(
  '/_dashboard/super-agent/fixtures/$fixId/review',
)({
  loader: async ({ params }) => {
    const reviewComments = await getReviewCommentsFn({
      data: { id: params.fixId },
    })
    return { reviewComments }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { reviewStats, fixId } = fixIdRoute.useLoaderData()
  const { reviewComments } = Route.useLoaderData()

  const homeAgentId = reviewStats.agents.find(
    (agent) => agent.team_id === reviewStats.fixture.home_team_id,
  )?.agent_id
  const awayAgentId = reviewStats.agents.find(
    (agent) => agent.team_id === reviewStats.fixture.away_team_id,
  )?.agent_id

  const homeReview = reviewComments.find(
    (comment) => comment.team === reviewStats.fixture.home_team_id,
  )
  const awayReview = reviewComments.find(
    (comment) => comment.team === reviewStats.fixture.away_team_id,
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReviewCommentsList
          title={reviewStats.fixture.home_team}
          fixtureId={fixId}
          teamId={reviewStats.fixture.home_team_id}
          agentId={homeAgentId as number}
          reviewId={homeReview?.id}
          initialComments={homeReview?.review ?? []}
        />
        <ReviewCommentsList
          title={reviewStats.fixture.away_team}
          fixtureId={fixId}
          teamId={reviewStats.fixture.away_team_id}
          agentId={awayAgentId as number}
          reviewId={awayReview?.id}
          initialComments={awayReview?.review ?? []}
        />
      </div>

      <div className="space-y-2">
        {reviewStats.stats.map((eventStat) => (
          <EventCardReview key={eventStat.event_id} event={eventStat} />
        ))}
      </div>
    </div>
  )
}
