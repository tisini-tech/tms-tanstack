import {
  HorizontalBar,
  PercentBar,
  RoundedBar,
  StatCard,
  StatsRow,
} from '#/components/fixtures/stats/stat-bars'
import { getEventCount, getSubEventCount } from '#/lib/utils'
import type { TeamStats } from '#/lib/types'

function pair(home: number, away: number) {
  const total = home + away
  if (total === 0) return { home: 0, away: 0 }
  const homeShare = Math.round((home / total) * 100)
  return { home: homeShare, away: Math.round((away / total) * 100) }
}

export function FootballTeamStats({ stats }: { stats: TeamStats[] }) {
  const event = (id: string, isHome: boolean) =>
    getEventCount(id, stats, isHome)
  const sub = (id: string, subId: string, isHome: boolean) =>
    getSubEventCount(id, subId, stats, isHome)

  const possession = pair(
    event('7', true) + sub('95', '152', true),
    event('7', false) + sub('95', '152', false),
  )

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

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <StatCard title="General">
          <PercentBar
            hValue={possession.home}
            aValue={possession.away}
            stat="possession"
          />
        </StatCard>

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
          <HorizontalBar
            hValue={sub('200', '471', true)}
            aValue={sub('200', '471', false)}
            stat="Freekick 1/3"
          />
          <HorizontalBar
            hValue={event('155', true)}
            aValue={event('154', false)}
            stat="Touch in opp box"
          />
          <HorizontalBar
            hValue={event('154', true)}
            aValue={event('154', false)}
            stat="Carry in opp box"
          />
          <HorizontalBar
            hValue={event('10', true)}
            aValue={event('10', false)}
            stat="Offside"
          />
        </StatCard>

        <StatCard title="Chances">
          <HorizontalBar
            hValue={event('203', true)}
            aValue={event('203', false)}
            stat="Chances"
          />
          <div className="space-y-2 border-l border-border pl-3">
            <StatsRow
              hValue={sub('203', '477', true)}
              aValue={sub('203', '477', false)}
              stat="Cross"
            />
            <StatsRow
              hValue={sub('203', '473', true)}
              aValue={sub('203', '473', false)}
              stat="Key pass"
            />
            <StatsRow
              hValue={sub('203', '474', true)}
              aValue={sub('203', '474', false)}
              stat="Freekick"
            />
            <StatsRow
              hValue={sub('203', '475', true)}
              aValue={sub('203', '475', false)}
              stat="Cornerkick"
            />
            <StatsRow
              hValue={sub('203', '476', true)}
              aValue={sub('203', '476', false)}
              stat="Throw-in"
            />
          </div>
        </StatCard>
      </div>

      <div className="space-y-4">
        <StatCard title="Passing">
          <RoundedBar
            hValue={event('7', true)}
            aValue={event('7', false)}
            hTotal={event('25', true) + event('7', true)}
            aTotal={event('25', false) + event('7', false)}
            stat="Complete pass"
          />
          <RoundedBar
            hValue={sub('95', '152', true)}
            aValue={sub('95', '152', false)}
            hTotal={event('95', true)}
            aTotal={event('95', false)}
            stat="Complete prog pass"
          />
          <HorizontalBar
            hValue={sub('204', '478', true) + sub('204', '479', true)}
            aValue={sub('204', '478', false) + sub('204', '479', false)}
            stat="Ball won"
          />
          <HorizontalBar
            hValue={sub('204', '480', true)}
            aValue={sub('204', '480', false)}
            stat="Second ball"
          />
          <HorizontalBar
            hValue={sub('204', '481', true) + sub('204', '482', true)}
            aValue={sub('204', '481', false) + sub('204', '482', false)}
            stat="Ball lost"
          />
          <HorizontalBar
            hValue={sub('12', '400', true)}
            aValue={sub('12', '400', false)}
            stat="Throw-in"
          />
          <HorizontalBar
            hValue={sub('12', '399', true)}
            aValue={sub('12', '399', false)}
            stat="Long throw-in"
          />
          <RoundedBar
            hValue={sub('159', '413', true)}
            aValue={sub('159', '413', false)}
            hTotal={event('159', true)}
            aTotal={event('159', false)}
            stat="Complete cross right"
          />
          <RoundedBar
            hValue={sub('166', '426', true)}
            aValue={sub('166', '426', false)}
            hTotal={event('166', true)}
            aTotal={event('166', false)}
            stat="Complete cross left"
          />
          <HorizontalBar
            hValue={event('3', true)}
            aValue={event('3', false)}
            stat="Cornerkicks"
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

      <div className="space-y-4">
        <StatCard title="Defense">
          <RoundedBar
            hValue={sub('97', '156', true)}
            aValue={sub('97', '156', false)}
            hTotal={event('97', true)}
            aTotal={event('97', false)}
            stat="Tackle made"
          />
          <HorizontalBar
            hValue={event('26', true)}
            aValue={event('26', false)}
            stat="Clearances"
          />
          <HorizontalBar
            hValue={sub('28', '403', true)}
            aValue={sub('28', '403', false)}
            stat="Interceptions own half"
          />
          <HorizontalBar
            hValue={sub('28', '404', true)}
            aValue={sub('28', '404', false)}
            stat="Interceptions opp half"
          />
        </StatCard>
      </div>

      <div className="space-y-4">
        <StatCard title="Goalkeeping">
          <HorizontalBar
            hValue={event('24', true)}
            aValue={event('24', false)}
            stat="Saves"
          />
          <HorizontalBar
            hValue={event('32', true)}
            aValue={event('32', false)}
            stat="Run-outs"
          />
          <RoundedBar
            hValue={sub('69', '80', true) + sub('69', '81', true)}
            aValue={sub('69', '80', false) + sub('69', '81', false)}
            hTotal={event('69', true)}
            aTotal={event('69', false)}
            stat="Successful claims"
          />
          <RoundedBar
            hValue={event('167', true)}
            aValue={event('167', false)}
            hTotal={event('167', true) + event('168', true)}
            aTotal={event('167', false) + event('168', false)}
            stat="Successful goal kick"
          />
          <HorizontalBar
            hValue={event('142', true)}
            aValue={event('142', false)}
            stat="Kick-outs"
          />
          <HorizontalBar
            hValue={event('68', true)}
            aValue={event('68', false)}
            stat="Throw-outs"
          />
        </StatCard>

        <StatCard title="Duels">
          <RoundedBar
            hValue={sub('93', '144', true)}
            aValue={sub('93', '144', false)}
            hTotal={event('93', true)}
            aTotal={event('93', false)}
            stat="Aerial duels won"
          />
        </StatCard>
      </div>
    </div>
  )
}
