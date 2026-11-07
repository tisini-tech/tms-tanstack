import type { PlayerStats, TopPlayerStats } from '#/lib/types'
import { getPercent } from '#/lib/utils'

export type TopPlayerRow = {
  id: number
  name: string
  photo: string
  jerseyNumber: number
  teamName: string
  matchesPlayed: number
  minutesPlayed: number
  cleanSheets: number
  rating: number | null
  attRating: number | null
  defRating: number | null
  gkRating: number | null
  pointsScored: number
  stats: PlayerStats[]
  values: Record<string, string | number>
}

export function toTopPlayerRows(
  players: TopPlayerStats[],
  isP90 = false,
  isCompP90 = false,
  matchType = 'football',
): TopPlayerRow[] {
  return players.map((player) => ({
    id: player.player_id,
    name: player.name,
    photo: player.passportphoto,
    jerseyNumber: player.jersey_no,
    teamName: player.team_name,
    matchesPlayed: player.matches_played,
    minutesPlayed: player.total_minutes_played,
    cleanSheets: player.clean_sheets,
    rating: player.avg_rating,
    attRating: player.att_rating,
    defRating: player.def_rating,
    gkRating: player.gk_rating,
    pointsScored: player.points_scored,
    stats: player.stats,
    values: matchType === 'football' ? footballValues(
      player.stats,
      player.total_minutes_played,
      isP90,
      isCompP90,
    ) : matchType.toLowerCase().includes('rugby') ? rugbyValues(player.stats) : {},
  }))
}

function getEventTotal(eventId: number, stats: PlayerStats[]) {
  return stats.find((stat) => stat.event_id === eventId)?.total ?? 0
}

function getSubEventTotal(
  eventId: number,
  subId: number,
  stats: PlayerStats[],
) {
  const eventStats = stats.find((stat) => stat.event_id === eventId)

  return (
    eventStats?.sub_events.find((sub) => sub.sub_event_id === subId)?.total ?? 0
  )
}

function ratio(complete: number, total: number, pct: number) {
  return `${complete} / ${total} ${pct}%`
}

function eventPer90(total: number, minsPlayed: number) {
  return Number((total / (minsPlayed / 90)).toFixed(2))
}

export function footballValues(
  stats: PlayerStats[],
  minsPlayed: number,
  isP90: boolean = false,
  isCompP90: boolean = false,
) {
  const goal = getEventTotal(19, stats)
  const assist = getEventTotal(23, stats)
  const chances = getEventTotal(203, stats)
  const offsides = getEventTotal(21, stats)

  const shotInBoxOnTarget =
    getSubEventTotal(165, 422, stats) + getSubEventTotal(238, 606, stats)
  const shotInBoxTotal =
    getEventTotal(165, stats) +
    getSubEventTotal(238, 606, stats) +
    getSubEventTotal(238, 607, stats) +
    getSubEventTotal(238, 608, stats) +
    getSubEventTotal(238, 609, stats)

  const shotOutBoxOnTarget =
    getSubEventTotal(156, 405, stats) + getSubEventTotal(238, 610, stats)
  const shotOutBoxTotal =
    getEventTotal(156, stats) +
    getSubEventTotal(238, 610, stats) +
    getSubEventTotal(238, 611, stats) +
    getSubEventTotal(238, 612, stats) +
    getSubEventTotal(238, 613, stats)

  const shotOnTarget = shotInBoxOnTarget + shotOutBoxOnTarget
  const totalShots = shotInBoxTotal + shotOutBoxTotal
  const shotAcc = getPercent(totalShots, shotOnTarget)

  const crossRightComplete =
    getSubEventTotal(166, 426, stats) + getSubEventTotal(240, 618, stats)
  const crossRightTotal =
    getEventTotal(166, stats) +
    getSubEventTotal(240, 618, stats) +
    getSubEventTotal(240, 619, stats) +
    getSubEventTotal(240, 620, stats)

  const crossLeftComplete =
    getSubEventTotal(159, 413, stats) + getSubEventTotal(240, 621, stats)
  const crossLeftTotal =
    getEventTotal(159, stats) +
    getSubEventTotal(240, 621, stats) +
    getSubEventTotal(240, 622, stats) +
    getSubEventTotal(240, 623, stats)

  const crossTotal = crossRightTotal + crossLeftTotal
  const crossComplete = crossRightComplete + crossLeftComplete
  const crossAcc = getPercent(crossTotal, crossComplete)

  const dribbles = getEventTotal(96, stats)
  const dribblesComplete = getSubEventTotal(96, 154, stats)
  const dribblesAcc = getPercent(dribbles, dribblesComplete)

  const passComplete = getEventTotal(7, stats)
  const incompletePass = getEventTotal(25, stats)
  const passTotal = passComplete + incompletePass
  const passAcc = getPercent(passTotal, passComplete)

  const progPassComplete = getSubEventTotal(95, 152, stats)
  const progPassTotal = getEventTotal(95, stats)
  const progPassAcc = getPercent(progPassTotal, progPassComplete)

  const tacklesTotal = getEventTotal(97, stats)
  const tacklesWon = getSubEventTotal(97, 156, stats)
  const tacklesAcc = getPercent(tacklesTotal, tacklesWon)

  const ballWon =
    getSubEventTotal(204, 478, stats) + getSubEventTotal(204, 479, stats)
  const ballLost =
    getSubEventTotal(204, 481, stats) + getSubEventTotal(204, 482, stats)
  const secondBall = getSubEventTotal(204, 480, stats)
  const interceptOwn = getSubEventTotal(28, 403, stats)
  const interceptOpp = getSubEventTotal(28, 404, stats)

  const aerial = getEventTotal(93, stats)
  const aerialWon = getSubEventTotal(93, 144, stats)
  const aerialAcc = getPercent(aerial, aerialWon)

  const claimsComplete =
    getSubEventTotal(69, 80, stats) + getSubEventTotal(69, 81, stats)
  const claimsTotal = getEventTotal(69, stats)
  const claimsAcc = getPercent(claimsTotal, claimsComplete)

  const throwoutsComplete = getSubEventTotal(68, 77, stats)
  const throwoutsTotal = getEventTotal(68, stats)
  const throwoutsAcc = getPercent(throwoutsTotal, throwoutsComplete)

  const runoutsComplete = getSubEventTotal(32, 34, stats)
  const runoutsTotal = getEventTotal(32, stats)
  const runoutsAcc = getPercent(runoutsTotal, runoutsComplete)

  const longGKComplete =
    getSubEventTotal(168, 429, stats) + getSubEventTotal(239, 616, stats)
  const longGKTotal =
    getEventTotal(168, stats) +
    getSubEventTotal(239, 616, stats) +
    getSubEventTotal(239, 617, stats)
  const shortGKComplete =
    getSubEventTotal(167, 428, stats) + getSubEventTotal(239, 614, stats)
  const shortGKTotal =
    getEventTotal(167, stats) +
    getSubEventTotal(239, 614, stats) +
    getSubEventTotal(239, 615, stats)
  const kickoutsComplete = getSubEventTotal(142, 307, stats)
  const kickoutsTotal = getEventTotal(142, stats)
  const distAttempts =
    longGKTotal + shortGKTotal + kickoutsTotal + throwoutsTotal
  const distComplete =
    longGKComplete + shortGKComplete + kickoutsComplete + throwoutsComplete
  const distRate = getPercent(distAttempts, distComplete)

  const foulWon = getSubEventTotal(11, 470, stats)
  const foulCommitted = getSubEventTotal(11, 74, stats)
  const yellow = getSubEventTotal(5, 21, stats)
  const red = getSubEventTotal(5, 22, stats)

  const boxTouch = getEventTotal(155, stats)
  const boxCarry = getEventTotal(154, stats)

  const clearance = getEventTotal(26, stats)
  const blocks = getEventTotal(202, stats)

  const saves = getEventTotal(24, stats)
  const penaltySaves = getSubEventTotal(24, 469, stats)

  return {
    goals: isP90 || isCompP90 ? eventPer90(goal, minsPlayed) : goal,
    assists: isP90 || isCompP90 ? eventPer90(assist, minsPlayed) : assist,
    chances: isP90 || isCompP90 ? eventPer90(chances, minsPlayed) : chances,
    offsides: isP90 || isCompP90 ? eventPer90(offsides, minsPlayed) : offsides,
    boxTouch: isP90 || isCompP90 ? eventPer90(boxTouch, minsPlayed) : boxTouch,
    boxCarry: isP90 || isCompP90 ? eventPer90(boxCarry, minsPlayed) : boxCarry,
    shots: isP90
      ? eventPer90(totalShots, minsPlayed)
      : isCompP90
        ? eventPer90(shotOnTarget, minsPlayed)
        : ratio(shotOnTarget, totalShots, shotAcc),

    dribbles: isP90
      ? eventPer90(dribbles, minsPlayed)
      : isCompP90
        ? eventPer90(dribblesComplete, minsPlayed)
        : ratio(dribblesComplete, dribbles, dribblesAcc),

    crosses: isP90
      ? eventPer90(crossTotal, minsPlayed)
      : isCompP90
        ? eventPer90(crossComplete, minsPlayed)
        : ratio(crossComplete, crossTotal, crossAcc),

    pass: isP90
      ? eventPer90(passTotal, minsPlayed)
      : isCompP90
        ? eventPer90(passComplete, minsPlayed)
        : ratio(passComplete, passTotal, passAcc),

    progPass: isP90
      ? eventPer90(progPassTotal, minsPlayed)
      : isCompP90
        ? eventPer90(progPassComplete, minsPlayed)
        : ratio(progPassComplete, progPassTotal, progPassAcc),

    tackles: isP90
      ? eventPer90(tacklesTotal, minsPlayed)
      : isCompP90
        ? eventPer90(tacklesWon, minsPlayed)
        : ratio(tacklesWon, tacklesTotal, tacklesAcc),

    ballWon: isP90 || isCompP90 ? eventPer90(ballWon, minsPlayed) : ballWon,
    ballLost: isP90 || isCompP90 ? eventPer90(ballLost, minsPlayed) : ballLost,

    secondBall:
      isP90 || isCompP90 ? eventPer90(secondBall, minsPlayed) : secondBall,

    interceptions:
      isP90 || isCompP90
        ? eventPer90(interceptOwn + interceptOpp, minsPlayed)
        : `${interceptOwn} / ${interceptOpp}`,

    clearances:
      isP90 || isCompP90 ? eventPer90(clearance, minsPlayed) : clearance,
    blocks: isP90 || isCompP90 ? eventPer90(blocks, minsPlayed) : blocks,

    aerial: isP90
      ? eventPer90(aerial, minsPlayed)
      : isCompP90
        ? eventPer90(aerialWon, minsPlayed)
        : ratio(aerialWon, aerial, aerialAcc),

    claims: isP90
      ? eventPer90(claimsTotal, minsPlayed)
      : isCompP90
        ? eventPer90(claimsComplete, minsPlayed)
        : ratio(claimsComplete, claimsTotal, claimsAcc),

    distribution: isP90
      ? eventPer90(distAttempts, minsPlayed)
      : isCompP90
        ? eventPer90(distComplete, minsPlayed)
        : `${distAttempts} ${distRate}%`,
    saves:
      isP90 || isCompP90
        ? eventPer90(saves, minsPlayed)
        : `${saves} / ${penaltySaves}`,

    runouts: isP90
      ? eventPer90(runoutsTotal, minsPlayed)
      : isCompP90
        ? eventPer90(runoutsComplete, minsPlayed)
        : ratio(runoutsComplete, runoutsTotal, runoutsAcc),

    throwouts: isP90
      ? eventPer90(throwoutsTotal, minsPlayed)
      : isCompP90
        ? eventPer90(throwoutsComplete, minsPlayed)
        : ratio(throwoutsComplete, throwoutsTotal, throwoutsAcc),

    fouls:
      isP90 || isCompP90
        ? eventPer90(foulCommitted, minsPlayed)
        : `${foulWon} / ${foulCommitted}`,

    yellowCards: isP90 ? eventPer90(yellow, minsPlayed) : yellow,
    redCards: isP90 ? eventPer90(red, minsPlayed) : red,
  } satisfies Record<string, string | number>
}

/**
 * Unified rugby metrics by event / sub-event id.
 * Sums legacy 7s + 15s ids and the newer unified pack (241+) so both
 * collection formats resolve instead of showing zeros.
 */
export function rugbyValues(stats: PlayerStats[]) {
  const sumEvents = (...eventIds: string[]) =>
    eventIds.reduce((sum, id) => sum + getEventTotal(Number(id), stats), 0)
  const sumSubs = (...pairs: Array<[string, string]>) =>
    pairs.reduce(
      (sum, [eventId, subId]) =>
        sum + getSubEventTotal(Number(eventId), Number(subId), stats),
      0,
    )

  // Tries — legacy 7s (33) / 15s (49) + unified Score → Try (253/638)
  // Do not use Score event total (253) — that includes conversions / penalties too.
  const tries = sumSubs(
    ['33', '51'],
    ['33', '142'],
    ['49', '66'],
    ['49', '200'],
    ['253', '638'],
  )

  const conversion = sumSubs(['33', '52'], ['49', '60'])
  const missConversion = sumSubs(['33', '69'], ['49', '42'])
  const penalty = sumSubs(['33', '53'], ['49', '44'])
  const missedPenalty = sumSubs(['33', '70'], ['49', '61'])
  const goalKicksMade = penalty + conversion
  const goalKicksTotal = penalty + conversion + missedPenalty + missConversion
  const goalKicksPct = getPercent(goalKicksTotal, goalKicksMade)

  // Assists still legacy-only (no unified assist event yet)
  const assists = sumEvents('180', '179', '254')
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
