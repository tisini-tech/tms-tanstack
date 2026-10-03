import type { FixturePlayerStats } from '#/lib/types'
import {
  getDashSubEvent,
  getDashTotal,
  playerStatsToResult,
} from '#/lib/dashboard/stats'
import {
  detectSport as detectSportKind,
  type SportKind as FullSportKind,
} from '#/lib/sports/detect-sport'
import { getPercent } from '#/lib/utils'

/** Player-stats column sports supported in the on-screen table today. */
export type SportKind = 'football' | 'rugby' | 'basketball'

export type StatColumn = {
  key: string
  label: string
}

export type PlayerStatRow = {
  id: number
  name: string
  rating: number
  minutesPlayed: number
  jerseyNumber: number
  photo: string
  teamId: number
  teamName: string
  values: Record<string, string | number>
}

export const SPORT_CATEGORIES: Record<SportKind, Record<string, StatColumn[]>> =
  {
    football: {
      Attacking: [
        { key: 'goal', label: 'Goal' },
        { key: 'assist', label: 'Assist' },
        { key: 'chances', label: 'Chances' },
        { key: 'offside', label: 'Offside' },
        { key: 'boxTouch', label: 'Box touch' },
        { key: 'boxCarry', label: 'Box carry' },
        { key: 'shots', label: 'Shots' },
        { key: 'crosses', label: 'Crosses' },
      ],
      Passing: [
        { key: 'pass', label: 'Pass' },
        { key: 'progPass', label: 'Prog pass' },
      ],
      Defense: [
        { key: 'tackles', label: 'Tackles' },
        { key: 'ballEfficiency', label: 'Ball efficiency' },
        { key: 'secondBall', label: 'Second ball' },
        { key: 'interception', label: 'Interception' },
        { key: 'clearance', label: 'Clearance' },
        { key: 'blocks', label: 'Blocks' },
        { key: 'aerial', label: 'Aerial' },
      ],
      Goalkeeping: [
        { key: 'claims', label: 'Claims' },
        { key: 'distribution', label: 'Distribution' },
        { key: 'saves', label: 'Saves' },
        { key: 'runouts', label: 'Runouts' },
        { key: 'throwouts', label: 'Throwouts' },
      ],
      Discipline: [
        { key: 'fouls', label: 'Fouls' },
        { key: 'cards', label: 'Cards' },
      ],
    },
    rugby: {
      Attacking: [
        { key: 'tries', label: 'Tries' },
        { key: 'assists', label: 'Assists' },
        { key: 'goalKicks', label: 'Goal kicks' },
        { key: 'linebreaks', label: 'Linebreaks' },
        { key: 'carries', label: 'Carries' },
        { key: 'offloads', label: 'Offloads' },
        { key: 'passes', label: 'Passes' },
        { key: 'handlingEfficiency', label: 'Handling efficiency' },
      ],
      Defense: [
        { key: 'tackleSuccess', label: 'Tackle success' },
        { key: 'tackleDominance', label: 'Tackle dominance' },
        { key: 'turnoverWon', label: 'Turnover won' },
      ],
      Setpiece: [
        { key: 'lineoutThrows', label: 'Lineout throws' },
        { key: 'lineoutSteals', label: 'Lineout steals' },
        { key: 'scrumsWon', label: 'Scrums won' },
        { key: 'scrumSteals', label: 'Scrum steals' },
        { key: 'ruckContest', label: 'Ruck contest' },
      ],
      Restarts: [
        { key: 'restartRetrievals', label: 'Restart retrievals' },
        { key: 'restartReception', label: 'Restart reception' },
        { key: 'retainedKicks', label: 'Retained kicks' },
        { key: 'kickingErrors', label: 'Kicking errors' },
      ],
      Discipline: [
        { key: 'penalties', label: 'Penalties' },
        { key: 'cards', label: 'Cards' },
      ],
    },
    basketball: {
      Scoring: [
        { key: 'points', label: 'Points' },
        { key: 'fieldGoals', label: 'Field goals' },
        { key: 'threePointers', label: '3PT' },
        { key: 'freeThrows', label: 'Free throws' },
      ],
      Playmaking: [
        { key: 'assists', label: 'Assists' },
        { key: 'turnovers', label: 'Turnovers' },
      ],
      Rebounding: [
        { key: 'rebounds', label: 'Rebounds' },
        { key: 'offensiveRebounds', label: 'Offensive' },
        { key: 'defensiveRebounds', label: 'Defensive' },
      ],
      Defense: [
        { key: 'steals', label: 'Steals' },
        { key: 'blocks', label: 'Blocks' },
        { key: 'fouls', label: 'Fouls' },
      ],
    },
  }

function playerName(player: FixturePlayerStats) {
  return [player.first_name, player.sir_name, player.other_name]
    .filter(Boolean)
    .join(' ')
}

function ratio(complete: number, total: number, pct: number) {
  return `${complete} / ${total} ${pct}%`
}

function eventTotalByName(player: FixturePlayerStats, names: string[]) {
  const lowered = names.map((name) => name.toLowerCase())
  return player.stats.reduce((sum, stat) => {
    if (lowered.some((name) => stat.event_name.toLowerCase().includes(name))) {
      return sum + stat.total
    }
    return sum
  }, 0)
}

function computeFootballValues(player: FixturePlayerStats) {
  const stats = playerStatsToResult(player.stats)

  const goal = getDashTotal('19', stats)
  const assist = getDashTotal('23', stats)
  const chances = getDashTotal('203', stats)
  const offside = getDashTotal('21', stats)

  const shotInBoxOnTarget =
    getDashSubEvent('165', '422', stats) + getDashSubEvent('238', '606', stats)
  const shotInBoxTotal =
    getDashTotal('165', stats) +
    getDashSubEvent('238', '606', stats) +
    getDashSubEvent('238', '607', stats) +
    getDashSubEvent('238', '608', stats) +
    getDashSubEvent('238', '609', stats)

  const shotOutBoxOnTarget =
    getDashSubEvent('156', '405', stats) + getDashSubEvent('238', '610', stats)
  const shotOutBoxTotal =
    getDashTotal('156', stats) +
    getDashSubEvent('238', '610', stats) +
    getDashSubEvent('238', '611', stats) +
    getDashSubEvent('238', '612', stats) +
    getDashSubEvent('238', '613', stats)

  const shotOnTarget = shotInBoxOnTarget + shotOutBoxOnTarget
  const totalShots = shotInBoxTotal + shotOutBoxTotal
  const shotAcc = getPercent(totalShots, shotOnTarget)

  const crossRightComplete =
    getDashSubEvent('166', '426', stats) + getDashSubEvent('240', '618', stats)
  const crossRightTotal =
    getDashTotal('166', stats) +
    getDashSubEvent('240', '618', stats) +
    getDashSubEvent('240', '619', stats) +
    getDashSubEvent('240', '620', stats)

  const crossLeftComplete =
    getDashSubEvent('159', '413', stats) + getDashSubEvent('240', '621', stats)
  const crossLeftTotal =
    getDashTotal('159', stats) +
    getDashSubEvent('240', '621', stats) +
    getDashSubEvent('240', '622', stats) +
    getDashSubEvent('240', '623', stats)

  const crossTotal = crossRightTotal + crossLeftTotal
  const crossComplete = crossRightComplete + crossLeftComplete
  const crossAcc = getPercent(crossTotal, crossComplete)

  const passComplete = getDashTotal('7', stats)
  const incompletePass = getDashTotal('25', stats)
  const passTotal = passComplete + incompletePass
  const passAcc = getPercent(passTotal, passComplete)

  const progPassComplete = getDashSubEvent('95', '152', stats)
  const progPassTotal = getDashTotal('95', stats)
  const progPassAcc = getPercent(progPassTotal, progPassComplete)

  const tacklesTotal = getDashTotal('97', stats)
  const tacklesWon = getDashSubEvent('97', '156', stats)
  const tacklesAcc = getPercent(tacklesTotal, tacklesWon)

  const ballWon =
    getDashSubEvent('204', '478', stats) + getDashSubEvent('204', '479', stats)
  const ballLost =
    getDashSubEvent('204', '481', stats) + getDashSubEvent('204', '482', stats)
  const secondBall = getDashSubEvent('204', '480', stats)
  const interceptOwn = getDashSubEvent('28', '403', stats)
  const interceptOpp = getDashSubEvent('28', '404', stats)

  const aerial = getDashTotal('93', stats)
  const aerialWon = getDashSubEvent('93', '144', stats)
  const aerialAcc = getPercent(aerial, aerialWon)

  const claimsComplete =
    getDashSubEvent('69', '80', stats) + getDashSubEvent('69', '81', stats)
  const claimsTotal = getDashTotal('69', stats)
  const claimsAcc = getPercent(claimsTotal, claimsComplete)

  const throwoutsComplete = getDashSubEvent('68', '77', stats)
  const throwoutsTotal = getDashTotal('68', stats)
  const throwoutsAcc = getPercent(throwoutsTotal, throwoutsComplete)

  const runoutsComplete = getDashSubEvent('32', '34', stats)
  const runoutsTotal = getDashTotal('32', stats)
  const runoutsAcc = getPercent(runoutsTotal, runoutsComplete)

  const longGKComplete =
    getDashSubEvent('168', '429', stats) + getDashSubEvent('239', '616', stats)
  const longGKTotal =
    getDashTotal('168', stats) +
    getDashSubEvent('239', '616', stats) +
    getDashSubEvent('239', '617', stats)
  const shortGKComplete =
    getDashSubEvent('167', '428', stats) + getDashSubEvent('239', '614', stats)
  const shortGKTotal =
    getDashTotal('167', stats) +
    getDashSubEvent('239', '614', stats) +
    getDashSubEvent('239', '615', stats)
  const kickoutsComplete = getDashSubEvent('142', '307', stats)
  const kickoutsTotal = getDashTotal('142', stats)
  const distAttempts =
    longGKTotal + shortGKTotal + kickoutsTotal + throwoutsTotal
  const distComplete =
    longGKComplete + shortGKComplete + kickoutsComplete + throwoutsComplete
  const distRate = getPercent(distAttempts, distComplete)

  const foulWon = getDashSubEvent('11', '470', stats)
  const foulCommitted = getDashSubEvent('11', '74', stats)
  const yellow = getDashSubEvent('5', '21', stats)
  const red = getDashSubEvent('5', '22', stats)

  return {
    goal,
    assist,
    chances,
    offside,
    boxTouch: getDashTotal('155', stats),
    boxCarry: getDashTotal('154', stats),
    shots: ratio(shotOnTarget, totalShots, shotAcc),
    crosses: ratio(crossComplete, crossTotal, crossAcc),
    pass: ratio(passComplete, passTotal, passAcc),
    progPass: ratio(progPassComplete, progPassTotal, progPassAcc),
    tackles: ratio(tacklesWon, tacklesTotal, tacklesAcc),
    ballEfficiency: `${ballWon} / ${ballLost}`,
    secondBall,
    interception: `${interceptOwn} / ${interceptOpp}`,
    clearance: getDashTotal('26', stats),
    blocks: getDashTotal('202', stats),
    aerial: ratio(aerialWon, aerial, aerialAcc),
    claims: ratio(claimsComplete, claimsTotal, claimsAcc),
    distribution: `${distAttempts} ${distRate}%`,
    saves: getDashTotal('24', stats),
    runouts: ratio(runoutsComplete, runoutsTotal, runoutsAcc),
    throwouts: ratio(throwoutsComplete, throwoutsTotal, throwoutsAcc),
    fouls: `${foulWon} / ${foulCommitted}`,
    cards: `${yellow} / ${red}`,
  } satisfies Record<string, string | number>
}

/**
 * Unified rugby metrics by event / sub-event id.
 * Sums legacy 7s + 15s ids and the newer unified pack (241+) so both
 * collection formats resolve instead of showing zeros.
 */
function computeRugbyValues(player: FixturePlayerStats) {
  const stats = playerStatsToResult(player.stats)

  const sumEvents = (...eventIds: string[]) =>
    eventIds.reduce((sum, id) => sum + getDashTotal(id, stats), 0)
  const sumSubs = (...pairs: Array<[string, string]>) =>
    pairs.reduce(
      (sum, [eventId, subId]) => sum + getDashSubEvent(eventId, subId, stats),
      0,
    )

  // Tries — legacy 7s (33) / 15s (49) + unified Score (253)
  const tries =
    sumSubs(['33', '51'], ['33', '142'], ['49', '66'], ['49', '200']) +
    sumEvents('253')

  const conversion = sumSubs(['33', '52'], ['49', '60'])
  const missConversion = sumSubs(['33', '69'], ['49', '42'])
  const penalty = sumSubs(['33', '53'], ['49', '44'])
  const missedPenalty = sumSubs(['33', '70'], ['49', '61'])
  const goalKicksMade = penalty + conversion
  const goalKicksTotal =
    penalty + conversion + missedPenalty + missConversion
  const goalKicksPct = getPercent(goalKicksTotal, goalKicksMade)

  // Assists still legacy-only (no unified assist event yet)
  const assists = sumEvents('180', '179')
  // Carries 58/44 + unified 250; Linebreak 37/47 + 243; Offload 83/92 + 244; Pass 82/91 + 241
  const carries = sumEvents('58', '44', '250')
  const linebreaks = sumEvents('37', '47', '243')
  const offloads = sumEvents('83', '92', '244')
  const passes = sumEvents('82', '91', '241')

  const incomPass = sumEvents('86', '87')
  const forwardPass = sumEvents('36', '40')
  const knockOn = sumEvents('35', '41')
  const lostInCarry = sumEvents('149', '103')
  // Unified Handling Errors (255) is a single rolled-up event
  const handlingErrors =
    incomPass + forwardPass + knockOn + lostInCarry + sumEvents('255')
  const ballHandling = passes + offloads + carries
  const handling = handlingErrors + ballHandling
  const handlingPct = getPercent(handling, ballHandling)

  // Tackle 56/42 + 251; Missed Tackle 57/43 + 242
  const missedTackle = sumEvents('57', '43', '242')
  const tackles = sumEvents('56', '42', '251')
  const allTackles = tackles + missedTackle
  const posTackle = sumSubs(['56', '63'], ['42', '56'])
  const tackleSucc = getPercent(allTackles, tackles)
  const tackleDom = getPercent(tackles, posTackle)

  // Turnover 59/45 + 258; Penalties Conceded 60/46 + 257; Card 66/55 + 260
  const turnoverWon = sumEvents('59', '45', '258')
  const penalties = sumEvents('60', '46', '257')
  const yellow = sumSubs(['66', '54'], ['55', '46'])
  const red = sumSubs(['66', '55'], ['55', '45'])
  // Unified Card (260) has no yellow/red split in the pack yet — fall back to total
  const cardTotal = sumEvents('260')
  const yellowDisplay = yellow + (yellow === 0 && red === 0 ? cardTotal : 0)
  const redDisplay = red

  // Lineout Throw / Scrum — unified parents are totals; won/steal still legacy subs
  const lineoutThrow = sumEvents('150', '151', '263')
  const lineoutWon = sumSubs(
    ['150', '371'],
    ['150', '372'],
    ['150', '373'],
    ['150', '389'],
    ['151', '377'],
    ['151', '378'],
    ['151', '379'],
    ['151', '391'],
  )
  const lineoutSucc = getPercent(lineoutThrow, lineoutWon)
  const lineoutSteals = sumSubs(['62', '68'], ['50', '65'])

  const scrums = sumEvents('63', '51', '262')
  const scrumWon = sumSubs(['63', '47'], ['51', '38'])
  const scrumSucc = getPercent(scrums, scrumWon)
  const scrumSteals = sumSubs(['63', '67'], ['51', '58'])

  const retainedKicks =
    sumSubs(
      ['106', '167'],
      ['106', '168'],
      ['106', '188'],
      ['105', '164'],
      ['105', '165'],
      ['105', '186'],
    ) + sumEvents('268')
  const kickForTerritory = sumSubs(
    ['106', '161'],
    ['106', '203'],
    ['106', '187'],
    ['105', '159'],
    ['105', '202'],
    ['105', '185'],
  )
  const kickingErrors =
    kickForTerritory +
    sumSubs(['134', '266'], ['133', '251']) +
    sumEvents('267')

  const restartReception =
    sumSubs(
      ['134', '262'],
      ['134', '267'],
      ['134', '272'],
      ['133', '247'],
      ['133', '252'],
      ['133', '257'],
    ) + sumEvents('270')
  const restartRetrievals =
    sumSubs(
      ['134', '264'],
      ['134', '269'],
      ['134', '274'],
      ['133', '249'],
      ['133', '254'],
      ['133', '259'],
    ) + sumEvents('271')

  const rucks = sumEvents('207', '206')
  const ruckWon = sumSubs(['207', '526'], ['206', '524'])
  const ruckSucc = getPercent(rucks, ruckWon)

  return {
    tries,
    assists,
    goalKicks: `${goalKicksTotal} / ${goalKicksMade}  ${goalKicksPct}%`,
    linebreaks,
    carries,
    offloads,
    passes,
    handlingEfficiency: `${handling} / ${handlingErrors}  ${handlingPct}%`,
    tackleSuccess: `${tackles} / ${allTackles}  ${tackleSucc}%`,
    tackleDominance: `${posTackle} / ${tackles}  ${tackleDom}%`,
    turnoverWon,
    lineoutThrows: `${lineoutThrow} / ${lineoutWon}  ${lineoutSucc}%`,
    lineoutSteals,
    scrumsWon: `${scrums} / ${scrumWon}  ${scrumSucc}%`,
    scrumSteals,
    ruckContest: `${ruckWon} / ${rucks}  ${ruckSucc}%`,
    restartRetrievals,
    restartReception,
    retainedKicks,
    kickingErrors,
    penalties,
    cards: `${yellowDisplay} / ${redDisplay}`,
  } satisfies Record<string, string | number>
}

function computeNamedValues(
  player: FixturePlayerStats,
  mapping: Record<string, string[]>,
) {
  const values: Record<string, string | number> = {}
  for (const [key, names] of Object.entries(mapping)) {
    values[key] = eventTotalByName(player, names)
  }
  return values
}

const BASKETBALL_EVENT_MAP: Record<string, string[]> = {
  points: ['point', 'score'],
  fieldGoals: ['field goal', '2pt', 'two point'],
  threePointers: ['3pt', 'three'],
  freeThrows: ['free throw', 'ft'],
  assists: ['assist'],
  turnovers: ['turnover'],
  rebounds: ['rebound'],
  offensiveRebounds: ['offensive rebound'],
  defensiveRebounds: ['defensive rebound'],
  steals: ['steal'],
  blocks: ['block'],
  fouls: ['foul'],
}

/** Maps full sport detection onto player-stats column sets we support today. */
export function detectSport(matchType?: string | null): SportKind {
  const sport: FullSportKind = detectSportKind(matchType)
  if (sport === 'rugby') return 'rugby'
  if (sport === 'basketball') return 'basketball'
  return 'football'
}

export function toPlayerStatRows(
  players: FixturePlayerStats[],
  sport: SportKind,
): PlayerStatRow[] {
  return [...players]
    .map((player) => {
      const values =
        sport === 'football'
          ? computeFootballValues(player)
          : sport === 'rugby'
            ? computeRugbyValues(player)
            : computeNamedValues(player, BASKETBALL_EVENT_MAP)

      return {
        id: player.id,
        name: playerName(player),
        rating: player.rating,
        minutesPlayed: player.minutes_played,
        jerseyNumber: player.jersey_number,
        photo: player.passportphoto,
        teamId: player.team.team_id,
        teamName: player.team.team_name,
        values,
      }
    })
    .sort((a, b) => b.rating - a.rating)
}
