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

export function RugbyTeamStats({
  stats,
  sevens,
}: {
  stats: TeamStats[]
  sevens: boolean
}) {
  const event = (id: string, isHome: boolean) =>
    getEventCount(id, stats, isHome)
  const sub = (id: string, subId: string, isHome: boolean) =>
    getSubEventCount(id, subId, stats, isHome)

  const sum = (ids: Array<[string, string]>, isHome: boolean) =>
    ids.reduce((total, [eventId, subId]) => total + sub(eventId, subId, isHome), 0)

  if (sevens) {
    const possession = share(
      event('82', true) + event('58', true),
      event('82', false) + event('58', false),
    )
    const territoryHome =
      sum(
        [
          ['58', '364'],
          ['58', '365'],
        ],
        true,
      ) +
      sum(
        [
          ['58', '362'],
          ['58', '363'],
        ],
        false,
      )
    const territoryAway =
      sum(
        [
          ['58', '364'],
          ['58', '365'],
        ],
        false,
      ) +
      sum(
        [
          ['58', '362'],
          ['58', '363'],
        ],
        true,
      )
    const territoryTotal = event('58', true) + event('58', false)
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
    const restartWonIds: Array<[string, string]> = [
      ['134', '262'],
      ['134', '264'],
      ['134', '267'],
      ['134', '269'],
      ['134', '272'],
      ['134', '274'],
    ]
    const lineoutKeptIds: Array<[string, string]> = [
      ['150', '371'],
      ['150', '372'],
      ['150', '373'],
      ['150', '389'],
    ]

    return (
      <RugbyLayout
        possession={possession}
        territory={territory}
        defense={{
          neg: [sub('56', '64', true), sub('56', '64', false)],
          pos: [sub('56', '63', true), sub('56', '63', false)],
          made: [event('56', true), event('56', false)],
          madeTotal: [
            event('56', true) + event('57', true),
            event('56', false) + event('57', false),
          ],
          missed: [event('57', true), event('57', false)],
          turnovers: [event('59', true), event('59', false)],
        }}
        attack={{
          tries: [sub('33', '51', true), sub('33', '51', false)],
          carries: [event('58', true), event('58', false)],
          errors: [
            event('36', true) + event('86', true) + event('35', true) + event('149', true),
            event('36', false) +
              event('86', false) +
              event('35', false) +
              event('149', false),
          ],
          breaks: [event('37', true), event('37', false)],
          offloads: [event('83', true), event('83', false)],
          visit: [event('122', true), event('122', false)],
          pass: [event('82', true), event('82', false)],
          passTotal: [
            event('82', true) + event('36', true) + event('86', true),
            event('82', false) + event('36', false) + event('86', false),
          ],
          conversion: [sub('33', '52', true), sub('33', '52', false)],
          conversionTotal: [
            sub('33', '69', true) + sub('33', '52', true),
            sub('33', '52', false) + sub('33', '69', false),
          ],
        }}
        setPiece={{
          won: [
            sub('62', '49', true) +
              sub('62', '68', true) +
              sub('63', '47', true) +
              sub('63', '67', true),
            sub('62', '49', false) +
              sub('62', '68', false) +
              sub('63', '47', false) +
              sub('63', '67', false),
          ],
          scrumPen: [sub('60', '104', true), sub('60', '104', false)],
          scrumSteal: [sub('63', '67', true), sub('63', '67', false)],
          lineoutSteal: [sub('62', '68', true), sub('62', '68', false)],
          maulWon: [sub('147', '330', true), sub('147', '330', false)],
          maulLost: [sub('147', '331', true), sub('147', '331', false)],
          lineout: [sum(lineoutKeptIds, true), sum(lineoutKeptIds, false)],
          lineoutTotal: [event('150', true), event('150', false)],
          scrum: [sub('63', '47', true), sub('63', '47', false)],
          scrumTotal: [
            sub('63', '47', true) + sub('63', '47', true),
            sub('63', '47', false) + sub('63', '47', false),
          ],
        }}
        discipline={{
          penalty: [event('60', true), event('60', false)],
          yellow: [sub('66', '54', true), sub('66', '54', false)],
          red: [sub('66', '54', true), sub('66', '54', false)],
        }}
        restarts={{
          won: [sum(restartWonIds, true), sum(restartWonIds, false)],
          total: [event('134', true), event('134', false)],
        }}
        zones={{
          own22: [sub('58', '362', true), sub('58', '362', false)],
          own50: [sub('58', '363', true), sub('58', '363', false)],
          opp50: [sub('58', '364', true), sub('58', '364', false)],
          opp22: [sub('58', '365', true), sub('58', '365', false)],
        }}
      />
    )
  }

  const possession = share(
    event('91', true) + event('44', true),
    event('91', false) + event('44', false),
  )
  const territoryHome =
    sub('44', '359', true) +
    sub('44', '360', true) +
    sub('44', '357', false) +
    sub('44', '358', false)
  const territoryAway =
    sub('44', '359', false) +
    sub('44', '360', false) +
    sub('44', '357', true) +
    sub('44', '358', true)
  const territoryTotal = event('44', true) + event('44', false)
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
  const restartWonIds: Array<[string, string]> = [
    ['133', '247'],
    ['133', '249'],
    ['133', '252'],
    ['133', '254'],
    ['133', '257'],
    ['133', '259'],
  ]
  const lineoutKeptIds: Array<[string, string]> = [
    ['151', '377'],
    ['151', '378'],
    ['151', '379'],
    ['151', '391'],
  ]

  return (
    <RugbyLayout
      possession={possession}
      territory={territory}
      defense={{
        neg: [sub('42', '57', true), sub('42', '57', false)],
        pos: [sub('42', '56', true), sub('42', '56', false)],
        made: [event('42', true), event('42', false)],
        madeTotal: [
          event('42', true) + event('43', true),
          event('42', false) + event('43', false),
        ],
        missed: [event('43', true), event('43', false)],
        turnovers: [event('45', true), event('45', false)],
      }}
      attack={{
        tries: [sub('49', '66', true), sub('49', '66', false)],
        carries: [event('44', true), event('44', false)],
        errors: [
          event('40', true) + event('41', true) + event('87', true) + event('103', true),
          event('40', false) + event('41', false) + event('87', false) + event('103', false),
        ],
        breaks: [event('47', true), event('47', false)],
        offloads: [event('92', true), event('92', false)],
        visit: [event('104', true), event('104', false)],
        pass: [event('91', true), event('91', false)],
        passTotal: [
          event('91', true) + event('40', true) + event('87', true),
          event('91', false) + event('40', false) + event('87', false),
        ],
        conversion: [sub('49', '60', true), sub('49', '60', false)],
        conversionTotal: [
          sub('49', '60', true) + sub('49', '42', true),
          sub('49', '60', false) + sub('49', '42', false),
        ],
      }}
      setPiece={{
        won: [
          sub('50', '40', true) +
            sub('50', '65', true) +
            sub('51', '38', true) +
            sub('51', '58', true),
          sub('50', '40', false) +
            sub('50', '65', false) +
            sub('51', '38', false) +
            sub('51', '58', false),
        ],
        scrumPen: [sub('46', '129', true), sub('46', '129', false)],
        scrumSteal: [sub('51', '58', true), sub('51', '58', false)],
        lineoutSteal: [sub('50', '65', true), sub('50', '65', false)],
        maulWon: [sub('146', '328', true), sub('146', '328', false)],
        maulLost: [sub('146', '329', true), sub('146', '329', false)],
        lineout: [sum(lineoutKeptIds, true), sum(lineoutKeptIds, false)],
        lineoutTotal: [event('151', true), event('151', false)],
        scrum: [sub('51', '38', true), sub('51', '38', false)],
        scrumTotal: [
          sub('51', '38', true) + sub('51', '39', true),
          sub('51', '38', false) + sub('51', '39', false),
        ],
      }}
      discipline={{
        penalty: [event('46', true), event('46', false)],
        yellow: [sub('55', '46', true), sub('55', '46', false)],
        red: [sub('55', '45', true), sub('55', '45', false)],
      }}
      restarts={{
        won: [sum(restartWonIds, true), sum(restartWonIds, false)],
        total: [event('133', true), event('133', false)],
      }}
      zones={{
        own22: [sub('44', '357', true), sub('44', '357', false)],
        own50: [sub('44', '358', true), sub('44', '358', false)],
        opp50: [sub('44', '359', true), sub('44', '359', false)],
        opp22: [sub('44', '360', true), sub('44', '360', false)],
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
            <HorizontalBar hValue={defense.neg[0]} aValue={defense.neg[1]} stat="negative tackles" />
            <HorizontalBar hValue={defense.pos[0]} aValue={defense.pos[1]} stat="positive tackles" />
            <RoundedBar
              hValue={defense.made[0]}
              aValue={defense.made[1]}
              hTotal={defense.madeTotal[0]}
              aTotal={defense.madeTotal[1]}
              stat="successful tackles"
            />
            <HorizontalBar hValue={defense.missed[0]} aValue={defense.missed[1]} stat="missed tackles" />
            <HorizontalBar hValue={defense.turnovers[0]} aValue={defense.turnovers[1]} stat="turnovers won" />
          </StatCard>
          <StatCard title="Discipline">
            <HorizontalBar hValue={discipline.penalty[0]} aValue={discipline.penalty[1]} stat="penalties conceded" />
            <StatsRow hValue={discipline.yellow[0]} aValue={discipline.yellow[1]} stat="yellow cards" />
            <StatsRow hValue={discipline.red[0]} aValue={discipline.red[1]} stat="red cards" />
          </StatCard>
          <StatCard title="Restarts">
            <HorizontalBar hValue={restarts.won[0]} aValue={restarts.won[1]} stat="restarts won" />
            <RoundedBar
              hValue={restarts.won[0]}
              aValue={restarts.won[1]}
              hTotal={restarts.total[0]}
              aTotal={restarts.total[1]}
              stat="restarts"
            />
          </StatCard>
          <StatCard title="Zones of play">
            <HorizontalBar hValue={zones.own22[0]} aValue={zones.own22[1]} stat="own 22" />
            <HorizontalBar hValue={zones.own50[0]} aValue={zones.own50[1]} stat="own 50" />
            <HorizontalBar hValue={zones.opp50[0]} aValue={zones.opp50[1]} stat="opp 50" />
            <HorizontalBar hValue={zones.opp22[0]} aValue={zones.opp22[1]} stat="opp 22" />
          </StatCard>
      </div>

      <div className="space-y-4">
        <StatCard title="Attack">
          <HorizontalBar hValue={attack.tries[0]} aValue={attack.tries[1]} stat="tries" />
          <HorizontalBar hValue={attack.carries[0]} aValue={attack.carries[1]} stat="carries" />
          <RoundedBar
            hValue={attack.pass[0]}
            aValue={attack.pass[1]}
            hTotal={attack.passTotal[0]}
            aTotal={attack.passTotal[1]}
            stat="pass accuracy"
          />
          <HorizontalBar hValue={attack.errors[0]} aValue={attack.errors[1]} stat="handling errors" />
          <HorizontalBar hValue={attack.breaks[0]} aValue={attack.breaks[1]} stat="line breaks" />
          <HorizontalBar hValue={attack.offloads[0]} aValue={attack.offloads[1]} stat="offloads" />
          <RoundedBar
            hValue={attack.conversion[0]}
            aValue={attack.conversion[1]}
            hTotal={attack.conversionTotal[0]}
            aTotal={attack.conversionTotal[1]}
            stat="conversions"
          />
          <HorizontalBar hValue={attack.visit[0]} aValue={attack.visit[1]} stat="opponent 22 visit" />
        </StatCard>

        <StatCard title="Set pieces">
          <HorizontalBar hValue={setPiece.won[0]} aValue={setPiece.won[1]} stat="set pieces won" />
          <RoundedBar
            hValue={setPiece.scrum[0]}
            aValue={setPiece.scrum[1]}
            hTotal={setPiece.scrumTotal[0]}
            aTotal={setPiece.scrumTotal[1]}
            stat="scrum retention"
          />
          <HorizontalBar hValue={setPiece.scrumPen[0]} aValue={setPiece.scrumPen[1]} stat="scrum penalties" />
          <HorizontalBar hValue={setPiece.scrumSteal[0]} aValue={setPiece.scrumSteal[1]} stat="scrum steals" />
          <RoundedBar
            hValue={setPiece.lineout[0]}
            aValue={setPiece.lineout[1]}
            hTotal={setPiece.lineoutTotal[0]}
            aTotal={setPiece.lineoutTotal[1]}
            stat="lineout retention"
          />
          <HorizontalBar hValue={setPiece.lineoutSteal[0]} aValue={setPiece.lineoutSteal[1]} stat="lineout steals" />
          <HorizontalBar hValue={setPiece.maulWon[0]} aValue={setPiece.maulWon[1]} stat="successful mauls" />
          <HorizontalBar hValue={setPiece.maulLost[0]} aValue={setPiece.maulLost[1]} stat="unsuccessful mauls" />
        </StatCard>
      </div>
    </section>
  )
}
