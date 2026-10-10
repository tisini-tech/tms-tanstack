import {
  HorizontalBar,
  RoundedBar,
  StatCard,
  StatsRow,
} from '#/components/fixtures/stats/stat-bars'
import { getSequencesForTeam } from '#/components/pdf-reports/transform-report-data'
import { getEventCount, getPassSeqs, getSubEventCount } from '#/lib/utils'
import type { FixtureEventSequence, SimpleFixture, TeamStats } from '#/lib/types'

type FootballSimpleTeamStatsProps = {
  stats: TeamStats[]
  sequences: FixtureEventSequence | undefined
  fixture: SimpleFixture
  allowedSides: Array<'home' | 'away'>
}

export function FootballSimpleTeamStats({
  stats,
  sequences,
  fixture,
  allowedSides,
}: FootballSimpleTeamStatsProps) {
  const event = (id: string, isHome: boolean) =>
    getEventCount(id, stats, isHome)
  const sub = (id: string, subId: string, isHome: boolean) =>
    getSubEventCount(id, subId, stats, isHome)

  const shotIn = {
    home: sub('165', '422', true) + sub('238', '606', true),
    away: sub('165', '422', false) + sub('238', '606', false),
    homeTotal:
      event('165', true) +
      sub('238', '606', true) +
      sub('238', '607', true) +
      sub('238', '608', true) +
      sub('238', '609', true),
    awayTotal:
      event('165', false) +
      sub('238', '606', false) +
      sub('238', '607', false) +
      sub('238', '608', false) +
      sub('238', '609', false),
  }
  const shotOut = {
    home: sub('156', '405', true) + sub('238', '610', true),
    away: sub('156', '405', false) + sub('238', '610', false),
    homeTotal:
      event('156', true) +
      sub('238', '610', true) +
      sub('238', '611', true) +
      sub('238', '612', true) +
      sub('238', '613', true),
    awayTotal:
      event('156', false) +
      sub('238', '610', false) +
      sub('238', '611', false) +
      sub('238', '612', false) +
      sub('238', '613', false),
  }

  const recoveryOwn = {
    home: sub('204', '478', true),
    away: sub('204', '478', false),
  }
  const recoveryOpp = {
    home: sub('204', '479', true),
    away: sub('204', '479', false),
  }

  const restartComplete = {
    home:
      sub('142', '307', true) +
      sub('68', '77', true) +
      sub('167', '428', true) +
      sub('168', '429', true) +
      sub('216', '522', true) +
      sub('239', '614', true) +
      sub('239', '616', true),
    away:
      sub('142', '307', false) +
      sub('68', '77', false) +
      sub('167', '428', false) +
      sub('168', '429', false) +
      sub('216', '522', false) +
      sub('239', '614', false) +
      sub('239', '616', false),
  }
  const restartTotal = {
    home:
      event('142', true) +
      event('68', true) +
      event('167', true) +
      event('168', true) +
      event('216', true) +
      event('239', true),
    away:
      event('142', false) +
      event('68', false) +
      event('167', false) +
      event('168', false) +
      event('216', false) +
      event('239', false),
  }

  return (
    <div className="space-y-4">
      {allowedSides.map((side) => {
        const teamId =
          side === 'home' ? fixture.home_team_id : fixture.away_team_id
        const teamName = side === 'home' ? fixture.home_team : fixture.away_team
        const buckets = getPassSeqs(getSequencesForTeam(sequences, teamId))

        return (
          <StatCard key={side} title={`${teamName} pass sequences`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SequenceCount label="Over 10+ pass sequence" value={buckets.over10} />
              <SequenceCount
                label="Between 7 - 9 pass sequence"
                value={buckets.btwn7to9}
              />
              <SequenceCount
                label="Between 4 - 6 pass sequence"
                value={buckets.btwn4to6}
              />
              <SequenceCount
                label="Below 3 pass sequence"
                value={buckets.below3}
              />
            </div>
          </StatCard>
        )
      })}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StatCard title="Attack">
          <RoundedBar
            hValue={shotIn.home}
            aValue={shotIn.away}
            hTotal={shotIn.homeTotal}
            aTotal={shotIn.awayTotal}
            stat="Attempts inside box"
          />
          <RoundedBar
            hValue={shotOut.home}
            aValue={shotOut.away}
            hTotal={shotOut.homeTotal}
            aTotal={shotOut.awayTotal}
            stat="Attempts outside box"
          />
        </StatCard>

        <StatCard title="Ball recovery">
          <HorizontalBar
            hValue={recoveryOpp.home + recoveryOwn.home}
            aValue={recoveryOpp.away + recoveryOwn.away}
            stat="Total recoveries"
          />
          <StatsRow
            hValue={recoveryOpp.home}
            aValue={recoveryOpp.away}
            stat="Opponent's half"
          />
          <StatsRow
            hValue={recoveryOwn.home}
            aValue={recoveryOwn.away}
            stat="Own half"
          />
        </StatCard>

        <StatCard title="Goalkeeper">
          <HorizontalBar
            hValue={event('24', true)}
            aValue={event('24', false)}
            stat="Saves"
          />
          <RoundedBar
            hValue={restartComplete.home}
            aValue={restartComplete.away}
            hTotal={restartTotal.home}
            aTotal={restartTotal.away}
            stat="Successful goal kick"
          />
        </StatCard>

        <StatCard title="Discipline">
          <HorizontalBar
            hValue={sub('11', '74', true)}
            aValue={sub('11', '74', false)}
            stat="Fouls committed"
          />
          <StatsRow
            hValue={sub('5', '21', true)}
            aValue={sub('5', '21', false)}
            stat="Yellow cards"
          />
          <StatsRow
            hValue={sub('5', '22', true)}
            aValue={sub('5', '22', false)}
            stat="Red cards"
          />
        </StatCard>
      </div>
    </div>
  )
}

function SequenceCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
