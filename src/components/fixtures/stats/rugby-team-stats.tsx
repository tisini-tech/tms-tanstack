import {
  HorizontalBar,
  PercentBar,
  RoundedBar,
  StatCard,
  StatsRow,
} from '#/components/fixtures/stats/stat-bars'
import { getEventCount, getSubEventCount } from '#/lib/utils'
import type { TeamStats } from '#/lib/types'

function share(home: number, away: number) {
  const total = home + away
  if (total === 0) return { home: 0, away: 0 }
  return {
    home: Math.round((home / total) * 100),
    away: Math.round((away / total) * 100),
  }
}

type SubId = [string, string]

/** Legacy 7s, legacy 15s, and the unified pack. A fixture uses one catalog, so the others add zero. */
const PASS = ['82', '91', '241']
const CARRY = ['58', '44', '250']
const OWN_22: SubId[] = [
  ['58', '362'],
  ['44', '357'],
  ['250', '624'],
]
const OWN_50: SubId[] = [
  ['58', '363'],
  ['44', '358'],
  ['250', '625'],
]
const OPP_50: SubId[] = [
  ['58', '364'],
  ['44', '359'],
  ['250', '626'],
]
const OPP_22: SubId[] = [
  ['58', '365'],
  ['44', '360'],
  ['250', '627'],
]
const LINEOUT_KEPT: SubId[] = [
  ['150', '371'],
  ['150', '372'],
  ['150', '373'],
  ['150', '389'],
  ['151', '377'],
  ['151', '378'],
  ['151', '379'],
  ['151', '391'],
  ['263', '705'],
  ['263', '706'],
  ['263', '707'],
  ['263', '713'],
]
const RESTART_WON: SubId[] = [
  ['134', '262'],
  ['134', '264'],
  ['134', '267'],
  ['134', '269'],
  ['134', '272'],
  ['134', '274'],
  ['133', '247'],
  ['133', '249'],
  ['133', '252'],
  ['133', '254'],
  ['133', '257'],
  ['133', '259'],
  ['270', '739'],
  ['270', '741'],
  ['271', '743'],
  ['271', '745'],
]

export function RugbyTeamStats({ stats }: { stats: TeamStats[] }) {
  const event = (id: string, isHome: boolean) =>
    getEventCount(id, stats, isHome)
  const sub = (id: string, subId: string, isHome: boolean) =>
    getSubEventCount(id, subId, stats, isHome)

  const events = (ids: string[], isHome: boolean) =>
    ids.reduce((total, id) => total + event(id, isHome), 0)

  const subs = (pairs: SubId[], isHome: boolean) =>
    pairs.reduce(
      (total, [eventId, subId]) => total + sub(eventId, subId, isHome),
      0,
    )

  const both = (count: (isHome: boolean) => number): [number, number] => [
    count(true),
    count(false),
  ]

  const possession = share(
    events(PASS, true) + events(CARRY, true),
    events(PASS, false) + events(CARRY, false),
  )
  const territoryHome =
    subs(OPP_50, true) +
    subs(OPP_22, true) +
    subs(OWN_22, false) +
    subs(OWN_50, false)
  const territoryAway =
    subs(OPP_50, false) +
    subs(OPP_22, false) +
    subs(OWN_22, true) +
    subs(OWN_50, true)
  const territoryTotal = events(CARRY, true) + events(CARRY, false)
  const territory = {
    home:
      territoryTotal === 0
        ? 0
        : Math.round((territoryHome / territoryTotal) * 100),
    away:
      territoryTotal === 0
        ? 0
        : Math.round((territoryAway / territoryTotal) * 100),
  }

  const lineoutWon = (isHome: boolean) =>
    subs(
      [
        ['62', '49'],
        ['50', '40'],
        ['263', '705'],
        ['263', '706'],
        ['263', '707'],
        ['263', '713'],
      ],
      isHome,
    )
  const lineoutSteal = (isHome: boolean) =>
    subs(
      [
        ['62', '68'],
        ['50', '65'],
        ['264', '717'],
      ],
      isHome,
    )
  const scrumWon = (isHome: boolean) =>
    subs(
      [
        ['63', '47'],
        ['51', '38'],
        ['262', '702'],
      ],
      isHome,
    )
  const scrumSteal = (isHome: boolean) =>
    subs(
      [
        ['63', '67'],
        ['51', '58'],
        ['262', '704'],
      ],
      isHome,
    )
  const maulWon = (isHome: boolean) =>
    subs(
      [
        ['147', '330'],
        ['146', '328'],
        ['265', '718'],
      ],
      isHome,
    )

  const yellow = (isHome: boolean) =>
    subs(
      [
        ['66', '54'],
        ['55', '46'],
      ],
      isHome,
    )
  const red = (isHome: boolean) =>
    subs(
      [
        ['66', '55'],
        ['55', '45'],
      ],
      isHome,
    )

  return (
    <RugbyLayout
      possession={possession}
      territory={territory}
      defense={{
        neg: both((isHome) =>
          subs(
            [
              ['56', '64'],
              ['42', '57'],
              ['251', '629'],
            ],
            isHome,
          ),
        ),
        pos: both((isHome) =>
          subs(
            [
              ['56', '63'],
              ['42', '56'],
              ['251', '628'],
            ],
            isHome,
          ),
        ),
        made: both((isHome) => events(['56', '42', '251'], isHome)),
        madeTotal: both(
          (isHome) =>
            events(['56', '42', '251'], isHome) +
            events(['57', '43', '242'], isHome),
        ),
        missed: both((isHome) => events(['57', '43', '242'], isHome)),
        turnovers: both((isHome) => events(['59', '45', '258'], isHome)),
      }}
      attack={{
        tries: both((isHome) =>
          subs(
            [
              ['33', '51'],
              ['33', '142'],
              ['49', '66'],
              ['49', '200'],
              ['253', '638'],
            ],
            isHome,
          ),
        ),
        carries: both((isHome) => events(CARRY, isHome)),
        errors: both((isHome) =>
          events(
            ['36', '86', '35', '149', '40', '41', '87', '103', '255'],
            isHome,
          ),
        ),
        breaks: both((isHome) => events(['37', '47', '243'], isHome)),
        offloads: both((isHome) => events(['83', '92', '244'], isHome)),
        visit: both((isHome) => events(['122', '104', '245'], isHome)),
        pass: both((isHome) => events(PASS, isHome)),
        passTotal: both(
          (isHome) =>
            events(PASS, isHome) +
            events(['36', '40', '86', '87'], isHome) +
            subs(
              [
                ['255', '644'],
                ['255', '645'],
              ],
              isHome,
            ),
        ),
        conversion: both((isHome) =>
          subs(
            [
              ['33', '52'],
              ['49', '60'],
              ['253', '635'],
            ],
            isHome,
          ),
        ),
        conversionTotal: both((isHome) =>
          subs(
            [
              ['33', '52'],
              ['33', '69'],
              ['49', '60'],
              ['49', '42'],
              ['253', '635'],
              ['253', '632'],
            ],
            isHome,
          ),
        ),
      }}
      setPiece={{
        won: both(
          (isHome) =>
            lineoutWon(isHome) +
            lineoutSteal(isHome) +
            scrumWon(isHome) +
            scrumSteal(isHome),
        ),
        scrumPen: both((isHome) =>
          subs(
            [
              ['60', '104'],
              ['46', '129'],
              ['257', '661'],
            ],
            isHome,
          ),
        ),
        scrumSteal: both(scrumSteal),
        lineoutSteal: both(lineoutSteal),
        maulWon: both(maulWon),
        maulLost: both(
          (isHome) =>
            subs(
              [
                ['147', '331'],
                ['146', '329'],
              ],
              isHome,
            ) +
            Math.max(0, event('265', isHome) - sub('265', '718', isHome)),
        ),
        lineout: both((isHome) => subs(LINEOUT_KEPT, isHome)),
        lineoutTotal: both((isHome) => events(['150', '151', '263'], isHome)),
        scrum: both(scrumWon),
        scrumTotal: both((isHome) => events(['63', '51', '262'], isHome)),
      }}
      discipline={{
        penalty: both((isHome) => events(['60', '46', '257'], isHome)),
        yellow: both((isHome) =>
          yellow(isHome) === 0 && red(isHome) === 0
            ? event('260', isHome)
            : yellow(isHome),
        ),
        red: both(red),
      }}
      restarts={{
        won: both((isHome) => subs(RESTART_WON, isHome)),
        total: both((isHome) => events(['134', '133', '270', '271'], isHome)),
      }}
      zones={{
        own22: both((isHome) => subs(OWN_22, isHome)),
        own50: both((isHome) => subs(OWN_50, isHome)),
        opp50: both((isHome) => subs(OPP_50, isHome)),
        opp22: both((isHome) => subs(OPP_22, isHome)),
      }}
    />
  )
}

type Pair = [number, number]

function RugbyLayout({
  possession,
  territory,
  defense,
  attack,
  setPiece,
  discipline,
  restarts,
  zones,
}: {
  possession: { home: number; away: number }
  territory: { home: number; away: number }
  defense: {
    neg: Pair
    pos: Pair
    made: Pair
    madeTotal: Pair
    missed: Pair
    turnovers: Pair
  }
  attack: {
    tries: Pair
    carries: Pair
    errors: Pair
    breaks: Pair
    offloads: Pair
    visit: Pair
    pass: Pair
    passTotal: Pair
    conversion: Pair
    conversionTotal: Pair
  }
  setPiece: {
    won: Pair
    scrumPen: Pair
    scrumSteal: Pair
    lineoutSteal: Pair
    maulWon: Pair
    maulLost: Pair
    lineout: Pair
    lineoutTotal: Pair
    scrum: Pair
    scrumTotal: Pair
  }
  discipline: { penalty: Pair; yellow: Pair; red: Pair }
  restarts: { won: Pair; total: Pair }
  zones: { own22: Pair; own50: Pair; opp50: Pair; opp22: Pair }
}) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <StatCard title="General">
          <PercentBar
            hValue={possession.home}
            aValue={possession.away}
            stat="possession"
          />
          <PercentBar
            hValue={territory.home}
            aValue={territory.away}
            stat="territory"
          />
        </StatCard>
        <StatCard title="Defense">
          <HorizontalBar
            hValue={defense.neg[0]}
            aValue={defense.neg[1]}
            stat="negative tackles"
          />
          <HorizontalBar
            hValue={defense.pos[0]}
            aValue={defense.pos[1]}
            stat="positive tackles"
          />
          <RoundedBar
            hValue={defense.made[0]}
            aValue={defense.made[1]}
            hTotal={defense.madeTotal[0]}
            aTotal={defense.madeTotal[1]}
            stat="successful tackles"
          />
          <HorizontalBar
            hValue={defense.missed[0]}
            aValue={defense.missed[1]}
            stat="missed tackles"
          />
          <HorizontalBar
            hValue={defense.turnovers[0]}
            aValue={defense.turnovers[1]}
            stat="turnovers won"
          />
        </StatCard>
        <StatCard title="Discipline">
          <HorizontalBar
            hValue={discipline.penalty[0]}
            aValue={discipline.penalty[1]}
            stat="penalties conceded"
          />
          <StatsRow
            hValue={discipline.yellow[0]}
            aValue={discipline.yellow[1]}
            stat="yellow cards"
          />
          <StatsRow
            hValue={discipline.red[0]}
            aValue={discipline.red[1]}
            stat="red cards"
          />
        </StatCard>
        <StatCard title="Restarts">
          <HorizontalBar
            hValue={restarts.won[0]}
            aValue={restarts.won[1]}
            stat="restarts won"
          />
          <RoundedBar
            hValue={restarts.won[0]}
            aValue={restarts.won[1]}
            hTotal={restarts.total[0]}
            aTotal={restarts.total[1]}
            stat="restarts"
          />
        </StatCard>
        <StatCard title="Zones of play">
          <HorizontalBar
            hValue={zones.own22[0]}
            aValue={zones.own22[1]}
            stat="own 22"
          />
          <HorizontalBar
            hValue={zones.own50[0]}
            aValue={zones.own50[1]}
            stat="own 50"
          />
          <HorizontalBar
            hValue={zones.opp50[0]}
            aValue={zones.opp50[1]}
            stat="opp 50"
          />
          <HorizontalBar
            hValue={zones.opp22[0]}
            aValue={zones.opp22[1]}
            stat="opp 22"
          />
        </StatCard>
      </div>

      <div className="space-y-4">
        <StatCard title="Attack">
          <HorizontalBar
            hValue={attack.tries[0]}
            aValue={attack.tries[1]}
            stat="tries"
          />
          <HorizontalBar
            hValue={attack.carries[0]}
            aValue={attack.carries[1]}
            stat="carries"
          />
          <RoundedBar
            hValue={attack.pass[0]}
            aValue={attack.pass[1]}
            hTotal={attack.passTotal[0]}
            aTotal={attack.passTotal[1]}
            stat="pass accuracy"
          />
          <HorizontalBar
            hValue={attack.errors[0]}
            aValue={attack.errors[1]}
            stat="handling errors"
          />
          <HorizontalBar
            hValue={attack.breaks[0]}
            aValue={attack.breaks[1]}
            stat="line breaks"
          />
          <HorizontalBar
            hValue={attack.offloads[0]}
            aValue={attack.offloads[1]}
            stat="offloads"
          />
          <RoundedBar
            hValue={attack.conversion[0]}
            aValue={attack.conversion[1]}
            hTotal={attack.conversionTotal[0]}
            aTotal={attack.conversionTotal[1]}
            stat="conversions"
          />
          <HorizontalBar
            hValue={attack.visit[0]}
            aValue={attack.visit[1]}
            stat="opponent 22 visit"
          />
        </StatCard>

        <StatCard title="Set pieces">
          <HorizontalBar
            hValue={setPiece.won[0]}
            aValue={setPiece.won[1]}
            stat="set pieces won"
          />
          <RoundedBar
            hValue={setPiece.scrum[0]}
            aValue={setPiece.scrum[1]}
            hTotal={setPiece.scrumTotal[0]}
            aTotal={setPiece.scrumTotal[1]}
            stat="scrum retention"
          />
          <HorizontalBar
            hValue={setPiece.scrumPen[0]}
            aValue={setPiece.scrumPen[1]}
            stat="scrum penalties"
          />
          <HorizontalBar
            hValue={setPiece.scrumSteal[0]}
            aValue={setPiece.scrumSteal[1]}
            stat="scrum steals"
          />
          <RoundedBar
            hValue={setPiece.lineout[0]}
            aValue={setPiece.lineout[1]}
            hTotal={setPiece.lineoutTotal[0]}
            aTotal={setPiece.lineoutTotal[1]}
            stat="lineout retention"
          />
          <HorizontalBar
            hValue={setPiece.lineoutSteal[0]}
            aValue={setPiece.lineoutSteal[1]}
            stat="lineout steals"
          />
          <HorizontalBar
            hValue={setPiece.maulWon[0]}
            aValue={setPiece.maulWon[1]}
            stat="successful mauls"
          />
          <HorizontalBar
            hValue={setPiece.maulLost[0]}
            aValue={setPiece.maulLost[1]}
            stat="unsuccessful mauls"
          />
        </StatCard>
      </div>
    </section>
  )
}
