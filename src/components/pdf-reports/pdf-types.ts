export type ReportTeam = 'home' | 'away'

export type TableRowValue = { stats: string | number; acc?: string | number }

export type TableData = Record<string, TableRowValue | string>

export type PlayerTableRow = Record<string, string | number>

export type ChartSeries = {
  label: string
  values: number[]
}

export type QuarterChartData = {
  labels: string[]
  series: ChartSeries[]
}
