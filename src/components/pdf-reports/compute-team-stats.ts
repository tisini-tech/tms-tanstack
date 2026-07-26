import {
  getDashSubEvent,
  getDashTotal,
  type TeamStatsResult,
} from '#/lib/dashboard/stats'
import { getPercent } from '#/lib/utils'

import type { TableData } from './pdf-types'

export function computeAttackingStats(stats: TeamStatsResult): TableData {
  const setpiece =
    getDashTotal('203', stats) -
    getDashSubEvent('203', '473', stats) -
    getDashSubEvent('203', '477', stats)

  const dribbleComplete = getDashSubEvent('96', '154', stats)

  const shotOnTarget =
    getDashSubEvent('156', '405', stats) +
    getDashSubEvent('165', '422', stats) +
    getDashSubEvent('238', '606', stats) +
    getDashSubEvent('238', '610', stats)
  const shotTotal =
    getDashTotal('156', stats) +
    getDashTotal('165', stats) +
    getDashTotal('238', stats)
  const shotAcc = getPercent(shotTotal, shotOnTarget)

  const shotInBoxOnTarget =
    getDashSubEvent('165', '422', stats) + getDashSubEvent('238', '606', stats)
  const shotInBoxTotal =
    getDashTotal('165', stats) +
    getDashSubEvent('238', '606', stats) +
    getDashSubEvent('238', '607', stats) +
    getDashSubEvent('238', '608', stats) +
    getDashSubEvent('238', '609', stats)
  const shotInBoxAcc = getPercent(shotInBoxTotal, shotInBoxOnTarget)

  const shotOutBoxOnTarget =
    getDashSubEvent('156', '405', stats) + getDashSubEvent('238', '610', stats)
  const shotOutBoxTotal =
    getDashTotal('156', stats) +
    getDashSubEvent('238', '610', stats) +
    getDashSubEvent('238', '611', stats) +
    getDashSubEvent('238', '612', stats) +
    getDashSubEvent('238', '613', stats)
  const shotOutBoxAcc = getPercent(shotOutBoxTotal, shotOutBoxOnTarget)

  const passComplete = getDashTotal('7', stats)
  const incompletePass = getDashTotal('25', stats)
  const passTotal = passComplete + incompletePass
  const passAcc = getPercent(passTotal, passComplete)

  const progPassComplete = getDashSubEvent('95', '152', stats)
  const progPassTotal = getDashTotal('95', stats)
  const progPassAcc = getPercent(progPassTotal, progPassComplete)

  const rightCrossComplete =
    getDashSubEvent('166', '426', stats) + getDashSubEvent('240', '618', stats)
  const rightCrossTotal =
    getDashTotal('166', stats) +
    getDashSubEvent('240', '618', stats) +
    getDashSubEvent('240', '619', stats) +
    getDashSubEvent('240', '620', stats)
  const rightCrossAcc = getPercent(rightCrossTotal, rightCrossComplete)

  const leftCrossComplete =
    getDashSubEvent('159', '413', stats) + getDashSubEvent('240', '621', stats)
  const leftCrossTotal =
    getDashTotal('159', stats) +
    getDashSubEvent('240', '621', stats) +
    getDashSubEvent('240', '622', stats) +
    getDashSubEvent('240', '623', stats)
  const leftCrossAcc = getPercent(leftCrossTotal, leftCrossComplete)

  const crossTotal = rightCrossTotal + leftCrossTotal
  const crossComplete = rightCrossComplete + leftCrossComplete
  const crossAcc = getPercent(crossTotal, crossComplete)

  const ballWon =
    getDashSubEvent('204', '478', stats) + getDashSubEvent('204', '479', stats)
  const ballLost =
    getDashSubEvent('204', '481', stats) + getDashSubEvent('204', '482', stats)
  const secondBall = getDashSubEvent('204', '480', stats)

  return {
    'Total shots / on target': {
      stats: `${shotTotal} / ${shotOnTarget}`,
      acc: shotAcc,
    },
    'Shots inside / on target': {
      stats: `${shotInBoxTotal} / ${shotInBoxOnTarget}`,
      acc: shotInBoxAcc,
    },
    'Shots outside / on target': {
      stats: `${shotOutBoxTotal} / ${shotOutBoxOnTarget}`,
      acc: shotOutBoxAcc,
    },
    empty: '',
    'Key Pass': { stats: getDashSubEvent('203', '473', stats), acc: '' },
    'Cross Chance': { stats: getDashSubEvent('203', '477', stats), acc: '' },
    'Set-piece Chance': { stats: setpiece, acc: '' },
    empty2: '',
    'Box Touch': { stats: getDashTotal('155', stats), acc: '' },
    'Box Carry': { stats: getDashTotal('154', stats), acc: '' },
    'Dribbles / Complete': {
      stats: `${getDashTotal('96', stats)} / ${dribbleComplete}`,
      acc: getPercent(dribbleComplete, getDashTotal('96', stats)),
    },
    empty3: '',
    'Passes / Complete': {
      stats: `${passTotal} / ${passComplete}`,
      acc: passAcc,
    },
    'Progress Passes / Complete': {
      stats: `${progPassTotal} / ${progPassComplete}`,
      acc: progPassAcc,
    },
    empty4: '',
    'Total Cross / Complete': {
      stats: `${crossTotal} / ${crossComplete}`,
      acc: crossAcc,
    },
    'Cross right / Complete': {
      stats: `${rightCrossTotal} / ${rightCrossComplete}`,
      acc: rightCrossAcc,
    },
    'Cross left / Complete': {
      stats: `${leftCrossTotal} / ${leftCrossComplete}`,
      acc: leftCrossAcc,
    },
    empty5: '',
    'Ball Won / Lost': { stats: `${ballWon} / ${ballLost}`, acc: '' },
    'Second Ball': { stats: secondBall, acc: '' },
    empty6: '',
    'Corner Kick': { stats: getDashTotal('3', stats), acc: '' },
  }
}

export function computeDefenseStats(stats: TeamStatsResult): TableData {
  const clearance = getDashTotal('26', stats)
  const blocks = getDashTotal('202', stats)

  const tacklesTotal = getDashTotal('97', stats)
  const tacklesWon = getDashSubEvent('97', '156', stats)
  const tacklesAcc = getPercent(tacklesTotal, tacklesWon)

  const foulCommitted = getDashSubEvent('11', '74', stats)
  const foulWon = getDashTotal('11', stats) - foulCommitted

  const yellow = getDashSubEvent('5', '21', stats)
  const red = getDashSubEvent('5', '22', stats)

  const freekick = getDashSubEvent('200', '471', stats)

  const intercptOwn = getDashSubEvent('28', '403', stats)
  const intercptOpp = getDashSubEvent('28', '404', stats)

  const aerial = getDashTotal('93', stats)
  const aerialWon = getDashSubEvent('93', '144', stats)
  const aerialAcc = getPercent(aerial, aerialWon)

  const shortGKComplete =
    getDashSubEvent('167', '428', stats) + getDashSubEvent('239', '614', stats)
  const shortGKTotal =
    getDashTotal('167', stats) +
    getDashSubEvent('239', '614', stats) +
    getDashSubEvent('239', '615', stats)
  const shortGKAcc = getPercent(shortGKTotal, shortGKComplete)

  const longGKComplete =
    getDashSubEvent('168', '429', stats) + getDashSubEvent('239', '616', stats)
  const longGKTotal =
    getDashTotal('168', stats) +
    getDashSubEvent('239', '616', stats) +
    getDashSubEvent('239', '617', stats)
  const longGKAcc = getPercent(longGKTotal, longGKComplete)

  const totalGKComplete = shortGKComplete + longGKComplete
  const totalGKTotal = shortGKTotal + longGKTotal
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

  const claimsComplete =
    getDashSubEvent('69', '80', stats) + getDashSubEvent('69', '81', stats)
  const claimsTotal = getDashTotal('69', stats)
  const claimsAcc = getPercent(claimsTotal, claimsComplete)

  const subs = getDashTotal('17', stats)

  return {
    Blocks: { stats: blocks, acc: '' },
    Clearance: { stats: clearance, acc: '' },
    empty2: '',
    'Tackles / Won': {
      stats: `${tacklesTotal} / ${tacklesWon}`,
      acc: tacklesAcc,
    },
    'Foul Won / Committed': {
      stats: `${foulWon} / ${foulCommitted}`,
      acc: '',
    },
    'Card Yellow / Red': { stats: `${yellow} / ${red}`, acc: '' },
    empty: '',
    'Freekick 1/3': { stats: freekick, acc: '' },
    empty3: '',
    'Interception Own': { stats: intercptOwn, acc: '' },
    'Interception Opp': { stats: intercptOpp, acc: '' },
    empty4: '',
    'Aerial Duels / Won': {
      stats: `${aerial} / ${aerialWon}`,
      acc: aerialAcc,
    },
    empty5: '',
    'Goal Kicks / Complete': {
      stats: `${totalGKTotal} / ${totalGKComplete}`,
      acc: totalGKAcc,
    },
    'Short GK / Complete': {
      stats: `${shortGKTotal} / ${shortGKComplete}`,
      acc: shortGKAcc,
    },
    'Long GK / Complete': {
      stats: `${longGKTotal} / ${longGKComplete}`,
      acc: longGKAcc,
    },
    empty6: '',
    'Kick-outs / Complete': {
      stats: `${kickoutsTotal} / ${kickoutsComplete}`,
      acc: kickoutsAcc,
    },
    'Throw-outs / Complete': {
      stats: `${throwoutsTotal} / ${throwoutsComplete}`,
      acc: throwoutsAcc,
    },
    empty7: '',
    'Run-outs / Successful': {
      stats: `${runoutsTotal} / ${runoutsComplete}`,
      acc: runoutsAcc,
    },
    'Claims / Successful': {
      stats: `${claimsTotal} / ${claimsComplete}`,
      acc: claimsAcc,
    },
    empty8: '',
    Subs: { stats: subs, acc: '' },
  }
}
