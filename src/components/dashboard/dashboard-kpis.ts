import type { DashboardTeamStats } from '#/lib/types'

/** Known football event / sub-event ids used by KPI recipes. */
export const EVENT = {
  pass: 7,
  incompletePass: 25,
  progressivePass: 95,
  progressivePassComplete: 152,
  progressivePassIncomplete: 153,
  goal: 19,
  shot: 238,
  shotInBoxOnTarget: 606,
  shotInBoxOffTarget: 607,
  shotInBoxBlocked: 608,
  shotInBoxWoodwork: 609,
  shotOutBoxOnTarget: 610,
  shotOutBoxOffTarget: 611,
  shotOutBoxBlocked: 612,
  shotOutBoxWoodwork: 613,
  cross: 240,
  crossRightComplete: 618,
  crossRightIncomplete: 619,
  crossRightBlocked: 620,
  crossLeftComplete: 621,
  crossLeftIncomplete: 622,
  crossLeftBlocked: 623,
  boxTouch: 155,
  boxCarry: 154,
  chance: 203,
  aerialDuels: 93,
  aerialLost: 143,
  aerialWon: 144,
  dribbles: 96,
  dribbleComplete: 154,
  dribbleIncomplete: 155,
  tackle: 97,
  tackleWon: 156,
  tackleLost: 157,
  ball: 204,
  ballOwnWon: 478,
  ballOppWon: 479,
  ballSecond: 480,
  ballOwnLost: 481,
  ballOppLost: 482,
  foul: 11,
  foulWonFirstThird: 73,
  foulCommitted: 74,
  foulWonSecondThird: 470,
  save: 24,
  clearance: 26,
  interception: 28,
  runOut: 32,
  runOutSuccess: 34,
  runOutFail: 35,
  throwOut: 68,
  throwOutComplete: 77,
  throwOutIncomplete: 78,
  kickOut: 142,
  kickOutComplete: 307,
  kickOutIncomplete: 308,
  claims: 69,
  claimMiss: 79,
  claimCatch: 80,
  claimPunch: 81,
  claimDrop: 82,
  blocks: 202,
} as const

export type KpiValueRef = {
  eventId: number
  subEventId?: number
}

export type DashboardKpiRecipe = {
  id: string
  label: string
  /** Show when any of these events are selected in the events table. */
  whenEventIds: number[]
  kind: 'avg_per_match' | 'rate'
  numerator: KpiValueRef[]
  /** Required for `rate` KPIs. */
  denominator?: KpiValueRef[]
  format: 'number' | 'percent'
}

const PASS_WHEN = [EVENT.pass, EVENT.incompletePass]
const IN_BOX_SHOTS = [
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxOnTarget },
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxOffTarget },
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxBlocked },
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxWoodwork },
]
const ON_TARGET_SHOTS = [
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxOnTarget },
  { eventId: EVENT.shot, subEventId: EVENT.shotOutBoxOnTarget },
]
const BLOCKED_SHOTS = [
  { eventId: EVENT.shot, subEventId: EVENT.shotInBoxBlocked },
  { eventId: EVENT.shot, subEventId: EVENT.shotOutBoxBlocked },
]
const CROSS_COMPLETE = [
  { eventId: EVENT.cross, subEventId: EVENT.crossRightComplete },
  { eventId: EVENT.cross, subEventId: EVENT.crossLeftComplete },
]
const CROSS_BLOCKED = [
  { eventId: EVENT.cross, subEventId: EVENT.crossRightBlocked },
  { eventId: EVENT.cross, subEventId: EVENT.crossLeftBlocked },
]
const CROSS_RIGHT = [
  { eventId: EVENT.cross, subEventId: EVENT.crossRightComplete },
  { eventId: EVENT.cross, subEventId: EVENT.crossRightIncomplete },
  { eventId: EVENT.cross, subEventId: EVENT.crossRightBlocked },
]

export const KPI_RECIPES: DashboardKpiRecipe[] = [
  {
    id: 'avg-passes',
    label: 'Avg passes / match',
    whenEventIds: PASS_WHEN,
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.pass }],
    format: 'number',
  },
  {
    id: 'pass-accuracy',
    label: 'Pass accuracy',
    whenEventIds: PASS_WHEN,
    kind: 'rate',
    numerator: [{ eventId: EVENT.pass }],
    denominator: [
      { eventId: EVENT.pass },
      { eventId: EVENT.incompletePass },
    ],
    format: 'percent',
  },
  {
    id: 'avg-progressive-passes',
    label: 'Avg progressive / match',
    whenEventIds: [EVENT.progressivePass],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.progressivePass }],
    format: 'number',
  },
  {
    id: 'progressive-pass-accuracy',
    label: 'Progressive accuracy',
    whenEventIds: [EVENT.progressivePass],
    kind: 'rate',
    numerator: [
      {
        eventId: EVENT.progressivePass,
        subEventId: EVENT.progressivePassComplete,
      },
    ],
    denominator: [
      {
        eventId: EVENT.progressivePass,
        subEventId: EVENT.progressivePassComplete,
      },
      {
        eventId: EVENT.progressivePass,
        subEventId: EVENT.progressivePassIncomplete,
      },
    ],
    format: 'percent',
  },
  {
    id: 'goals-per-match',
    label: 'Goals / match',
    whenEventIds: [EVENT.goal],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.goal }],
    format: 'number',
  },
  {
    id: 'avg-shots',
    label: 'Avg shots / match',
    whenEventIds: [EVENT.shot],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.shot }],
    format: 'number',
  },
  {
    id: 'conversion-rate',
    label: 'Conversion rate',
    whenEventIds: [EVENT.shot],
    kind: 'rate',
    numerator: [{ eventId: EVENT.goal }],
    denominator: [{ eventId: EVENT.shot }],
    format: 'percent',
  },
  {
    id: 'shot-accuracy',
    label: 'Shot accuracy',
    whenEventIds: [EVENT.shot],
    kind: 'rate',
    numerator: ON_TARGET_SHOTS,
    denominator: [{ eventId: EVENT.shot }],
    format: 'percent',
  },
  {
    id: 'in-box-share',
    label: 'In-box share',
    whenEventIds: [EVENT.shot],
    kind: 'rate',
    numerator: IN_BOX_SHOTS,
    denominator: [{ eventId: EVENT.shot }],
    format: 'percent',
  },
  {
    id: 'blocked-shot-share',
    label: 'Blocked %',
    whenEventIds: [EVENT.shot],
    kind: 'rate',
    numerator: BLOCKED_SHOTS,
    denominator: [{ eventId: EVENT.shot }],
    format: 'percent',
  },
  {
    id: 'avg-crosses',
    label: 'Avg crosses / match',
    whenEventIds: [EVENT.cross],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.cross }],
    format: 'number',
  },
  {
    id: 'cross-accuracy',
    label: 'Cross accuracy',
    whenEventIds: [EVENT.cross],
    kind: 'rate',
    numerator: CROSS_COMPLETE,
    denominator: [{ eventId: EVENT.cross }],
    format: 'percent',
  },
  {
    id: 'cross-right-share',
    label: 'Right-side share',
    whenEventIds: [EVENT.cross],
    kind: 'rate',
    numerator: CROSS_RIGHT,
    denominator: [{ eventId: EVENT.cross }],
    format: 'percent',
  },
  {
    id: 'cross-blocked-share',
    label: 'Cross blocked %',
    whenEventIds: [EVENT.cross],
    kind: 'rate',
    numerator: CROSS_BLOCKED,
    denominator: [{ eventId: EVENT.cross }],
    format: 'percent',
  },
  {
    id: 'avg-box-touches',
    label: 'Avg box touches / match',
    whenEventIds: [EVENT.boxTouch],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.boxTouch }],
    format: 'number',
  },
  {
    id: 'avg-box-carries',
    label: 'Avg box carries / match',
    whenEventIds: [EVENT.boxCarry],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.boxCarry }],
    format: 'number',
  },
  {
    id: 'avg-chances',
    label: 'Avg chances / match',
    whenEventIds: [EVENT.chance],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.chance }],
    format: 'number',
  },
  {
    id: 'chance-conversion',
    label: 'Chance conversion',
    whenEventIds: [EVENT.chance],
    kind: 'rate',
    numerator: [{ eventId: EVENT.goal }],
    denominator: [{ eventId: EVENT.chance }],
    format: 'percent',
  },
  {
    id: 'avg-aerial-duels',
    label: 'Avg aerial duels / match',
    whenEventIds: [EVENT.aerialDuels],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.aerialDuels }],
    format: 'number',
  },
  {
    id: 'aerial-win-rate',
    label: 'Aerial win %',
    whenEventIds: [EVENT.aerialDuels],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.aerialDuels, subEventId: EVENT.aerialWon },
    ],
    denominator: [
      { eventId: EVENT.aerialDuels, subEventId: EVENT.aerialWon },
      { eventId: EVENT.aerialDuels, subEventId: EVENT.aerialLost },
    ],
    format: 'percent',
  },
  {
    id: 'avg-tackles',
    label: 'Avg tackles / match',
    whenEventIds: [EVENT.tackle],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.tackle }],
    format: 'number',
  },
  {
    id: 'tackle-win-rate',
    label: 'Tackle win %',
    whenEventIds: [EVENT.tackle],
    kind: 'rate',
    numerator: [{ eventId: EVENT.tackle, subEventId: EVENT.tackleWon }],
    denominator: [
      { eventId: EVENT.tackle, subEventId: EVENT.tackleWon },
      { eventId: EVENT.tackle, subEventId: EVENT.tackleLost },
    ],
    format: 'percent',
  },
  {
    id: 'avg-dribbles',
    label: 'Avg dribbles / match',
    whenEventIds: [EVENT.dribbles],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.dribbles }],
    format: 'number',
  },
  {
    id: 'dribble-success-rate',
    label: 'Dribble success %',
    whenEventIds: [EVENT.dribbles],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.dribbles, subEventId: EVENT.dribbleComplete },
    ],
    denominator: [
      { eventId: EVENT.dribbles, subEventId: EVENT.dribbleComplete },
      { eventId: EVENT.dribbles, subEventId: EVENT.dribbleIncomplete },
    ],
    format: 'percent',
  },
  {
    id: 'avg-ball-events',
    label: 'Avg ball events / match',
    whenEventIds: [EVENT.ball],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.ball }],
    format: 'number',
  },
  {
    id: 'ball-own-win-rate',
    label: 'Own ball win %',
    whenEventIds: [EVENT.ball],
    kind: 'rate',
    numerator: [{ eventId: EVENT.ball, subEventId: EVENT.ballOwnWon }],
    denominator: [
      { eventId: EVENT.ball, subEventId: EVENT.ballOwnWon },
      { eventId: EVENT.ball, subEventId: EVENT.ballOwnLost },
    ],
    format: 'percent',
  },
  {
    id: 'second-ball-share',
    label: 'Second ball share',
    whenEventIds: [EVENT.ball],
    kind: 'rate',
    numerator: [{ eventId: EVENT.ball, subEventId: EVENT.ballSecond }],
    denominator: [{ eventId: EVENT.ball }],
    format: 'percent',
  },
  {
    id: 'avg-fouls',
    label: 'Avg fouls / match',
    whenEventIds: [EVENT.foul],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.foul }],
    format: 'number',
  },
  {
    id: 'foul-won-rate',
    label: 'Fouls won %',
    whenEventIds: [EVENT.foul],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.foul, subEventId: EVENT.foulWonFirstThird },
      { eventId: EVENT.foul, subEventId: EVENT.foulWonSecondThird },
    ],
    denominator: [
      { eventId: EVENT.foul, subEventId: EVENT.foulWonFirstThird },
      { eventId: EVENT.foul, subEventId: EVENT.foulWonSecondThird },
      { eventId: EVENT.foul, subEventId: EVENT.foulCommitted },
    ],
    format: 'percent',
  },
  {
    id: 'avg-saves',
    label: 'Avg saves / match',
    whenEventIds: [EVENT.save],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.save }],
    format: 'number',
  },
  {
    id: 'avg-clearances',
    label: 'Avg clearances / match',
    whenEventIds: [EVENT.clearance],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.clearance }],
    format: 'number',
  },
  {
    id: 'avg-interceptions',
    label: 'Avg interceptions / match',
    whenEventIds: [EVENT.interception],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.interception }],
    format: 'number',
  },
  {
    id: 'avg-run-outs',
    label: 'Avg run-outs / match',
    whenEventIds: [EVENT.runOut],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.runOut }],
    format: 'number',
  },
  {
    id: 'run-out-success-rate',
    label: 'Run-out success %',
    whenEventIds: [EVENT.runOut],
    kind: 'rate',
    numerator: [{ eventId: EVENT.runOut, subEventId: EVENT.runOutSuccess }],
    denominator: [
      { eventId: EVENT.runOut, subEventId: EVENT.runOutSuccess },
      { eventId: EVENT.runOut, subEventId: EVENT.runOutFail },
    ],
    format: 'percent',
  },
  {
    id: 'avg-throw-outs',
    label: 'Avg throw-outs / match',
    whenEventIds: [EVENT.throwOut],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.throwOut }],
    format: 'number',
  },
  {
    id: 'throw-out-accuracy',
    label: 'Throw-out accuracy',
    whenEventIds: [EVENT.throwOut],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.throwOut, subEventId: EVENT.throwOutComplete },
    ],
    denominator: [
      { eventId: EVENT.throwOut, subEventId: EVENT.throwOutComplete },
      { eventId: EVENT.throwOut, subEventId: EVENT.throwOutIncomplete },
    ],
    format: 'percent',
  },
  {
    id: 'avg-kick-outs',
    label: 'Avg kick-outs / match',
    whenEventIds: [EVENT.kickOut],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.kickOut }],
    format: 'number',
  },
  {
    id: 'kick-out-accuracy',
    label: 'Kick-out accuracy',
    whenEventIds: [EVENT.kickOut],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.kickOut, subEventId: EVENT.kickOutComplete },
    ],
    denominator: [
      { eventId: EVENT.kickOut, subEventId: EVENT.kickOutComplete },
      { eventId: EVENT.kickOut, subEventId: EVENT.kickOutIncomplete },
    ],
    format: 'percent',
  },
  {
    id: 'avg-claims',
    label: 'Avg claims / match',
    whenEventIds: [EVENT.claims],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.claims }],
    format: 'number',
  },
  {
    id: 'claim-success-rate',
    label: 'Claim success %',
    whenEventIds: [EVENT.claims],
    kind: 'rate',
    numerator: [
      { eventId: EVENT.claims, subEventId: EVENT.claimCatch },
      { eventId: EVENT.claims, subEventId: EVENT.claimPunch },
    ],
    denominator: [
      { eventId: EVENT.claims, subEventId: EVENT.claimMiss },
      { eventId: EVENT.claims, subEventId: EVENT.claimCatch },
      { eventId: EVENT.claims, subEventId: EVENT.claimPunch },
      { eventId: EVENT.claims, subEventId: EVENT.claimDrop },
    ],
    format: 'percent',
  },
  {
    id: 'avg-blocks',
    label: 'Avg blocks / match',
    whenEventIds: [EVENT.blocks],
    kind: 'avg_per_match',
    numerator: [{ eventId: EVENT.blocks }],
    format: 'number',
  },
]

export type ComputedKpi = {
  id: string
  label: string
  display: string
  detail?: string
  available: boolean
}

function sumRef(
  teamStats: DashboardTeamStats[],
  ref: KpiValueRef,
  matchIds: number[],
): number | null {
  const event = teamStats.find((row) => row.event_id === ref.eventId)
  if (!event) return null

  const matchSet = new Set(matchIds)

  if (ref.subEventId != null) {
    const sub = event.sub_events?.find(
      (row) => row.sub_event_id === ref.subEventId,
    )
    if (!sub) return null
    return (sub.matches ?? [])
      .filter((match) => matchSet.has(match.match_id))
      .reduce((sum, match) => sum + match.total, 0)
  }

  return (event.matches ?? [])
    .filter((match) => matchSet.has(match.match_id))
    .reduce((sum, match) => sum + match.total, 0)
}

function sumRefs(
  teamStats: DashboardTeamStats[],
  refs: KpiValueRef[],
  matchIds: number[],
): number | null {
  let total = 0
  for (const ref of refs) {
    const value = sumRef(teamStats, ref, matchIds)
    if (value == null) return null
    total += value
  }
  return total
}

function formatKpiValue(value: number, format: DashboardKpiRecipe['format']) {
  if (format === 'percent') return `${value.toFixed(1)}%`
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })
}

function unavailable(
  recipe: DashboardKpiRecipe,
  detail: string,
): ComputedKpi {
  return {
    id: recipe.id,
    label: recipe.label,
    display: '—',
    detail,
    available: false,
  }
}

export function computeDashboardKpis(opts: {
  teamStats: DashboardTeamStats[]
  matchIds: number[]
  loadedEventIds: number[]
  /** Parent event ids currently selected in the events table filter. */
  selectedEventIds: number[]
}): ComputedKpi[] {
  const loaded = new Set(opts.loadedEventIds)
  const selected = new Set(opts.selectedEventIds)
  const matchCount = opts.matchIds.length

  return KPI_RECIPES.filter(
    (recipe) =>
      recipe.whenEventIds.some((id) => selected.has(id)) &&
      recipe.whenEventIds.some((id) => loaded.has(id)),
  ).map((recipe) => {
    if (matchCount === 0) {
      return unavailable(recipe, 'No matches selected')
    }

    const numerator = sumRefs(
      opts.teamStats,
      recipe.numerator,
      opts.matchIds,
    )
    if (numerator == null) {
      return unavailable(recipe, 'Event not loaded')
    }

    if (recipe.kind === 'avg_per_match') {
      const avg = numerator / matchCount
      return {
        id: recipe.id,
        label: recipe.label,
        display: formatKpiValue(avg, recipe.format),
        detail: `${numerator.toLocaleString()} across ${matchCount} matches`,
        available: true,
      }
    }

    const denominatorRefs = recipe.denominator ?? []
    if (denominatorRefs.length === 0) {
      return unavailable(recipe, 'Missing denominator')
    }

    const denominator = sumRefs(
      opts.teamStats,
      denominatorRefs,
      opts.matchIds,
    )
    if (denominator == null) {
      return unavailable(recipe, 'Missing related event')
    }
    if (denominator <= 0) {
      return unavailable(recipe, 'No attempts in selection')
    }

    const rate = (numerator / denominator) * 100
    return {
      id: recipe.id,
      label: recipe.label,
      display: formatKpiValue(rate, recipe.format),
      detail: `${numerator.toLocaleString()} / ${denominator.toLocaleString()}`,
      available: true,
    }
  })
}
