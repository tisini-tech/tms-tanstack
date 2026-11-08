import { Link } from '@tanstack/react-router'

import type { Fixture } from '#/lib/types'
import { Button } from '#/components/ui/button'

function reviewableFixtureIds(fixtures: Fixture[]) {
  return fixtures
    .filter((fixture) => fixture.match_status !== 'notstarted')
    .map((fixture) => fixture.id)
}

export function FixtureReviewButton({ fixtures }: { fixtures: Fixture[] }) {
  const ids = reviewableFixtureIds(fixtures)

  if (ids.length === 0) {
    return (
      <Button type="button" size="sm" disabled>
        Review Selected
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      nativeButton={false}
      render={
        <Link
          to="/admin/fixtures/review"
          search={{ ids: ids.join(',') }}
        />
      }
    >
      Review Selected
    </Button>
  )
}
