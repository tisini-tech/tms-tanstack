import type { FixturePlayerStats } from '#/lib/types'
import {
  getDashSubEvent,
  getDashTotal,
  playerStatsToResult,
} from '#/lib/dashboard/stats'
import { getPercent } from '#/lib/utils'

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

const RUGBY_EVENT_MAP: Record<string, string[]> = {
  tries: ['try', 'tries'],
  assists: ['assist'],
  goalKicks: ['goal kick', 'conversion', 'penalty kick'],
  linebreaks: ['linebreak', 'line break'],
  carries: ['carry', 'carries'],
  offloads: ['offload'],
  passes: ['pass'],
  handlingEfficiency: ['handling'],
  tackleSuccess: ['tackle'],
  tackleDominance: ['dominance'],
  turnoverWon: ['turnover'],
  lineoutThrows: ['lineout throw'],
  lineoutSteals: ['lineout steal'],
  scrumsWon: ['scrum'],
  scrumSteals: ['scrum steal'],
  ruckContest: ['ruck'],
  restartRetrievals: ['restart retrieval'],
  restartReception: ['restart reception'],
  retainedKicks: ['retained kick'],
  kickingErrors: ['kicking error'],
  penalties: ['penalty'],
  cards: ['card', 'yellow', 'red'],
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

export function detectSport(matchType?: string | null): SportKind {
  const value = matchType?.toLowerCase() ?? ''
  if (value.includes('rugby') || value.includes('7s') || value.includes('sevens')) {
    return 'rugby'
  }
  if (value.includes('basket')) {
    return 'basketball'
  }
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
            ? computeNamedValues(player, RUGBY_EVENT_MAP)
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
