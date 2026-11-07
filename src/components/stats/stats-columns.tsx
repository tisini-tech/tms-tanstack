export type SportKind = 'football' | 'rugby' | 'basketball'

export type StatColumn = {
  key: string
  label: string
}

export const SPORT_CATEGORIES: Record<
  SportKind,
  Record<string, StatColumn[]>
> = {
  football: {
    Overall: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'minutesPlayed', label: 'Minutes played' },
      { key: 'goals', label: 'Goals' },
      { key: 'assists', label: 'Assists' },
      { key: 'cleanSheets', label: 'CS' },
      { key: 'attRating', label: 'Att rating' },
      { key: 'defRating', label: 'Def rating' },
      { key: 'gkRating', label: 'GK rating' },
      { key: 'rating', label: 'Overall rating' },
    ],
    Attacking: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'goals', label: 'Goals' },
      { key: 'assists', label: 'Assists' },
      { key: 'chances', label: 'Chances' },
      { key: 'shots', label: 'Shots' },
      { key: 'pass', label: 'Pass' },
      { key: 'progPass', label: 'Prog pass' },
      { key: 'crosses', label: 'Crosses' },
      { key: 'boxTouch', label: 'Box touch' },
      { key: 'boxCarry', label: 'Box carry' },
      { key: 'offside', label: 'Offside' },
      { key: 'dribbles', label: 'Dribbles' },
      { key: 'attRating', label: 'Att rating' },
    ],
    Defense: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'clearances', label: 'Clearances' },
      { key: 'interceptions', label: 'Interceptions' },
      { key: 'blocks', label: 'Blocks' },
      { key: 'ballWon', label: 'Ball won' },
      { key: 'secondBall', label: 'Second ball' },
      { key: 'ballLost', label: 'Ball lost' },
      { key: 'aerial', label: 'Aerial' },
      { key: 'tackles', label: 'Tackles' },
      { key: 'fouls', label: 'Fouls' },
      { key: 'yellowCards', label: 'Yellow cards' },
      { key: 'redCards', label: 'Red cards' },
      { key: 'defRating', label: 'Def rating' },
    ],
    Goalkeeping: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'cleanSheets', label: 'CS' },
      { key: 'saves', label: 'Saves' },
      { key: 'goalsConceded', label: 'Goals conceded' },
      { key: 'pass', label: 'Pass' },
      { key: 'distribution', label: 'Distribution' },
      { key: 'claims', label: 'Claims' },
      { key: 'runouts', label: 'Runouts' },
      { key: 'throwouts', label: 'Throwouts' },
      { key: 'clearances', label: 'Clearances' },
      { key: 'gkRating', label: 'GK rating' },
    ],
  },
  rugby: {
    Overall: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'minutesPlayed', label: 'Minutes played' },
      { key: 'pointsScored', label: 'Points' },
      { key: 'attRating', label: 'Att rating' },
      { key: 'defRating', label: 'Def rating' },
      { key: 'rating', label: 'Overall rating' },
    ],
    Attacking: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'tries', label: 'Tries' },
      { key: 'goalKicks', label: 'Goal kicks' },
      { key: 'passes', label: 'Passes' },
      { key: 'linebreaks', label: 'Linebreaks' },
      { key: 'carries', label: 'Carries' },
      { key: 'defBeaten', label: 'Def beaten' },
      { key: 'offloads', label: 'Offloads' },
      { key: 'handlingEfficiency', label: 'Handling efficiency' },
      { key: 'assists', label: 'Assists' },
      { key: 'attRating', label: 'Att rating' },
    ],
    Defense: [
      { key: 'matchesPlayed', label: 'MP' },
      { key: 'tackleSuccess', label: 'Tackle success' },
      { key: 'tackleDominance', label: 'Tackle dominance' },
      { key: 'turnoverWon', label: 'Turnover won' },
      { key: 'lineoutThrows', label: 'Lineout throws' },
      { key: 'lineoutSteals', label: 'Lineout steals' },
      { key: 'restartRetrievals', label: 'Restart retrievals' },
      { key: 'restartReception', label: 'Restart reception' },
      { key: 'penalties', label: 'Penalties' },
      { key: 'cards', label: 'Cards' },
      { key: 'defRating', label: 'Def rating' },
    ],
    // Setpiece: [
    //   { key: 'scrumsWon', label: 'Scrums won' },
    //   { key: 'scrumSteals', label: 'Scrum steals' },
    //   { key: 'ruckContest', label: 'Ruck contest' },
    // ],
    // Restarts: [
    //   { key: 'retainedKicks', label: 'Retained kicks' },
    //   { key: 'kickingErrors', label: 'Kicking errors' },
    // ],
    // Discipline: [
    // ],
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
