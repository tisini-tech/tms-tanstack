export interface QuarterStats {
  shotOnTarget: number
  totalShots: number
  chances: number
  completePasses: number
  defensiveActions: number
}

export type ChartTeamQuarterStats = Record<string, QuarterStats>

export type TeamChartImages = {
  shots: string
  chances: string
  defense: string
  possession: string
}
