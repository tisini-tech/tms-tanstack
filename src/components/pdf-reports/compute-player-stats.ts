import type { FixturePlayerStats } from '#/lib/types'

import {
  getDashSubEvent,
  getDashTotal,
  playerStatsToResult,
} from '#/lib/dashboard/stats'
import { getPercent } from '#/lib/utils'

import type { PlayerTableRow } from './pdf-types'

function playerName(player: FixturePlayerStats) {
  return [player.first_name, player.sir_name, player.other_name]
    .filter(Boolean)
    .join(' ')
}

function sortByRating(rows: PlayerTableRow[]) {
  return rows.sort((left, right) => {
    const leftRating =
      typeof left.rating === 'number'
        ? left.rating
        : parseFloat(String(left.rating ?? 0)) || 0
    const rightRating =
      typeof right.rating === 'number'
        ? right.rating
        : parseFloat(String(right.rating ?? 0)) || 0

    return rightRating - leftRating
  })
}

function computePlayerRowStats(player: FixturePlayerStats) {
  const stats = playerStatsToResult(player.stats)

  const goal = getDashTotal('19', stats)
  const assist = getDashTotal('23', stats)
  const chances = getDashTotal('203', stats)

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

  const boxTouch = getDashTotal('155', stats)
  const boxCarry = getDashTotal('154', stats)

  const passComplete = getDashTotal('7', stats)
  const incompletePass = getDashTotal('25', stats)
  const passTotal = passComplete + incompletePass
  const passAcc = getPercent(passTotal, passComplete)

  const progPassComplete = getDashSubEvent('95', '152', stats)
  const progPassTotal = getDashTotal('95', stats)
  const progPassAcc = getPercent(progPassTotal, progPassComplete)

  const blocks = getDashTotal('202', stats)
  const clearance = getDashTotal('26', stats)

  const interceptOwn = getDashSubEvent('28', '403', stats)
  const interceptOpp = getDashSubEvent('28', '404', stats)

  const ballWon =
    getDashSubEvent('204', '478', stats) + getDashSubEvent('204', '479', stats)
  const ballLost =
    getDashSubEvent('204', '481', stats) + getDashSubEvent('204', '482', stats)
  const secondBall = getDashSubEvent('204', '480', stats)

  const tacklesTotal = getDashTotal('97', stats)
  const tacklesWon = getDashSubEvent('97', '156', stats)
  const tacklesAcc = getPercent(tacklesTotal, tacklesWon)

  const aerial = getDashTotal('93', stats)
  const aerialWon = getDashSubEvent('93', '144', stats)
  const aerialAcc = getPercent(aerial, aerialWon)

  const saves = getDashTotal('24', stats)

  const claimsComplete =
    getDashSubEvent('69', '80', stats) + getDashSubEvent('69', '81', stats)
  const claimsTotal = getDashTotal('69', stats)
  const claimsAcc = getPercent(claimsTotal, claimsComplete)

  const foulWon = getDashSubEvent('11', '470', stats)
  const foulCommitted = getDashSubEvent('11', '74', stats)

  const yellow = getDashSubEvent('5', '21', stats)
  const red = getDashSubEvent('5', '22', stats)

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
  const totalGKComplete = longGKComplete + shortGKComplete
  const totalGKTotal = longGKTotal + shortGKTotal
  const totalGKAcc = getPercent(totalGKTotal, totalGKComplete)

  const kickoutsComplete = getDashSubEvent('142', '307', stats)
  const kickoutsTotal = getDashTotal('142', stats)
  const kickoutsAcc = getPercent(kickoutsTotal, kickoutsComplete)

  const throwoutsComplete = getDashSubEvent('68', '77', stats)
  const throwoutsTotal = getDashTotal('68', stats)
  const throwoutsAcc = getPercent(throwoutsTotal, throwoutsComplete)

  const runoutsComplete = getDashSubEvent('32', '34', stats)
  const runoutsTotal = getDashTotal('32', stats)
  const runoutsAcc = getPercent(runoutsTotal, runoutsComplete)

  const distAttempts =
    longGKTotal + shortGKTotal + kickoutsTotal + throwoutsTotal
  const distComplete =
    longGKComplete + shortGKComplete + kickoutsComplete + throwoutsComplete
  const distRate = getPercent(distAttempts, distComplete)

  return {
    goal,
    assist,
    chances,
    shotAcc,
    totalShots,
    shotOnTarget,
    crossTotal,
    crossComplete,
    crossAcc,
    boxTouch,
    boxCarry,
    passTotal,
    passComplete,
    passAcc,
    progPassTotal,
    progPassComplete,
    progPassAcc,
    blocks,
    clearance,
    interceptOwn,
    interceptOpp,
    ballWon,
    ballLost,
    secondBall,
    tacklesTotal,
    tacklesWon,
    tacklesAcc,
    aerial,
    aerialWon,
    aerialAcc,
    saves,
    claimsTotal,
    claimsComplete,
    claimsAcc,
    foulWon,
    foulCommitted,
    yellow,
    red,
    totalGKTotal,
    totalGKComplete,
    totalGKAcc,
    kickoutsTotal,
    kickoutsComplete,
    kickoutsAcc,
    throwoutsTotal,
    throwoutsComplete,
    throwoutsAcc,
    runoutsTotal,
    runoutsComplete,
    runoutsAcc,
    distAttempts,
    distRate,
  }
}

export function computeSinglePlayerGoalkeepingRow(
  player: FixturePlayerStats,
): PlayerTableRow {
  const values = computePlayerRowStats(player)
  const name = playerName(player)

  return {
    'Player name': name,
    rating: player.rating,
    Saves: values.saves,
    'Claims / successful': `${values.claimsTotal} / ${values.claimsComplete}  ${values.claimsAcc}%`,
    Distribution: `${values.distAttempts}  ${values.distRate}%`,
    'Goal kicks / complete': `${values.totalGKTotal} / ${values.totalGKComplete}  ${values.totalGKAcc}%`,
    'Kick-outs / complete': `${values.kickoutsTotal} / ${values.kickoutsComplete}  ${values.kickoutsAcc}%`,
    'Throw-outs / complete': `${values.throwoutsTotal} / ${values.throwoutsComplete}  ${values.throwoutsAcc}%`,
    'Run-outs / successful': `${values.runoutsTotal} / ${values.runoutsComplete}  ${values.runoutsAcc}%`,
  }
}

export function computePlayerStats(players: FixturePlayerStats[], teamId: number) {
  const teamPlayers = players.filter((player) => player.team.team_id === teamId)

  const playerAttackingStats: PlayerTableRow[] = []
  const playerDefensiveStats: PlayerTableRow[] = []
  const playerGoalkeepingStats: PlayerTableRow[] = []

  for (const player of teamPlayers) {
    const values = computePlayerRowStats(player)
    const name = playerName(player)

    playerAttackingStats.push({
      'Player name': name,
      rating: player.rating,
      mins: player.minutes_played,
      goal: values.goal,
      assist: values.assist,
      'Shots / on target': `${values.totalShots} / ${values.shotOnTarget}  ${values.shotAcc}%`,
      'Crosses / accurate': `${values.crossTotal} / ${values.crossComplete}  ${values.crossAcc}%`,
      'Box touch': values.boxTouch,
      'Box carry': values.boxCarry,
      chances: values.chances,
      'Passes / complete': `${values.passTotal} / ${values.passComplete}  ${values.passAcc}%`,
      'Progress Passes / complete': `${values.progPassTotal} / ${values.progPassComplete}  ${values.progPassAcc}%`,
    })

    playerDefensiveStats.push({
      'Player name': name,
      rating: player.rating,
      mins: player.minutes_played,
      Blocks: values.blocks,
      Clearance: values.clearance,
      'Interception own / opp': `${values.interceptOwn} / ${values.interceptOpp}`,
      'Ball won / lost': `${values.ballWon} / ${values.ballLost}`,
      'Second ball': values.secondBall,
      'Tackles / won': `${values.tacklesTotal} / ${values.tacklesWon}  ${values.tacklesAcc}%`,
      'Aerial duels / won': `${values.aerial} / ${values.aerialWon}  ${values.aerialAcc}%`,
      'Foul won / comm': `${values.foulWon} / ${values.foulCommitted}`,
      'Card yellow / red': `${values.yellow} / ${values.red}`,
    })

    const hasGoalkeepingStats =
      values.saves > 0 ||
      values.claimsTotal > 0 ||
      values.distAttempts > 0 ||
      values.totalGKTotal > 0 ||
      values.kickoutsTotal > 0 ||
      values.throwoutsTotal > 0 ||
      values.runoutsTotal > 0

    if (hasGoalkeepingStats) {
      playerGoalkeepingStats.push({
        'Player name': name,
        rating: player.rating,
        Saves: values.saves,
        'Claims / successful': `${values.claimsTotal} / ${values.claimsComplete}  ${values.claimsAcc}%`,
        Distribution: `${values.distAttempts}  ${values.distRate}%`,
        'Goal kicks / complete': `${values.totalGKTotal} / ${values.totalGKComplete}  ${values.totalGKAcc}%`,
        'Kick-outs / complete': `${values.kickoutsTotal} / ${values.kickoutsComplete}  ${values.kickoutsAcc}%`,
        'Throw-outs / complete': `${values.throwoutsTotal} / ${values.throwoutsComplete}  ${values.throwoutsAcc}%`,
        'Run-outs / successful': `${values.runoutsTotal} / ${values.runoutsComplete}  ${values.runoutsAcc}%`,
      })
    }
  }

  return {
    playerAttackingStats: sortByRating(playerAttackingStats),
    playerDefensiveStats: sortByRating(playerDefensiveStats),
    playerGoalkeepingStats: sortByRating(playerGoalkeepingStats),
  }
}
