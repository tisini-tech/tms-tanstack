export const TIME_INTERVALS = [
  '0-15',
  '16-30',
  '31-45',
  '46-60',
  '61-75',
  '76-90',
] as const

export type TimeInterval = (typeof TIME_INTERVALS)[number]

export type PlayerQuarterStat = {
  name: string
} & Record<TimeInterval, number>

export type AverageQuarterStats = Record<TimeInterval, number>

export type PlayerChartSize = {
  width: number
  height: number
}

/** Compact charts for match report player grid pages */
export const PLAYER_CHART_SIZE_GRID: PlayerChartSize = {
  width: 320,
  height: 170,
}

/** Full-width chart for single-player PDF report */
export const PLAYER_CHART_SIZE_REPORT: PlayerChartSize = {
  width: 540,
  height: 185,
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function calculateYAxisMax(
  players: PlayerQuarterStat[],
  average: AverageQuarterStats,
) {
  const allValues: number[] = []

  for (const player of players) {
    for (const interval of TIME_INTERVALS) {
      allValues.push(player[interval] ?? 0)
    }
  }

  for (const interval of TIME_INTERVALS) {
    allValues.push(average[interval] ?? 0)
  }

  const maxValue = Math.max(...allValues, 10)
  return Math.ceil(maxValue / 5) * 5
}

export async function generatePlayerPerformanceChart(
  player: PlayerQuarterStat,
  average: AverageQuarterStats,
  yAxisMax: number,
  size: PlayerChartSize = PLAYER_CHART_SIZE_GRID,
): Promise<string> {
  const { width: chartWidthPx, height: chartHeightPx } = size
  const canvas = createCanvas(chartWidthPx, chartHeightPx)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const chartLeft = 28
  const chartRight = chartWidthPx - 8
  const chartTop = 28
  const chartBottom = chartHeightPx - 22
  const chartWidth = chartRight - chartLeft
  const chartHeight = chartBottom - chartTop
  const step = chartWidth / (TIME_INTERVALS.length - 1)

  const playerValues = TIME_INTERVALS.map((interval) => player[interval] ?? 0)
  const averageValues = TIME_INTERVALS.map((interval) => average[interval] ?? 0)

  const toY = (value: number) =>
    chartBottom - (value / yAxisMax) * chartHeight

  const toPoint = (values: number[], index: number) => ({
    x: chartLeft + index * step,
    y: toY(values[index]),
  })

  const averagePoints = TIME_INTERVALS.map((_, index) =>
    toPoint(averageValues, index),
  )
  const playerPoints = TIME_INTERVALS.map((_, index) =>
    toPoint(playerValues, index),
  )

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, chartWidthPx, chartHeightPx)

  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(chartLeft, 10, 8, 8)
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 8px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(player.name.trim(), chartLeft + 12, 17)

  ctx.fillStyle = '#94a3b8'
  const avgLegendX = chartLeft + chartWidth * 0.4
  ctx.fillRect(avgLegendX, 10, 8, 8)
  ctx.fillStyle = '#64748b'
  ctx.font = '8px Helvetica, Arial, sans-serif'
  ctx.fillText('Average Events per Quarter', avgLegendX + 12, 17)

  const yTicks = 5
  const yStep = yAxisMax / yTicks
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.fillStyle = '#64748b'
  ctx.font = '7px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'right'

  for (let tick = 0; tick <= yTicks; tick++) {
    const value = tick * yStep
    const y = toY(value)

    ctx.beginPath()
    ctx.moveTo(chartLeft, y)
    ctx.lineTo(chartRight, y)
    ctx.stroke()

    ctx.fillText(String(Math.round(value)), chartLeft - 4, y + 2)
  }

  const drawArea = (
    points: Array<{ x: number; y: number }>,
    color: string,
  ) => {
    if (!points.length) return

    ctx.beginPath()
    ctx.moveTo(points[0].x, chartBottom)
    points.forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.lineTo(points[points.length - 1].x, chartBottom)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  drawArea(averagePoints, 'rgba(148, 163, 184, 0.35)')
  drawArea(playerPoints, 'rgba(59, 130, 246, 0.2)')

  const drawLine = (
    points: Array<{ x: number; y: number }>,
    color: string,
    width = 1.5,
  ) => {
    if (points.length < 2) return

    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.stroke()
  }

  drawLine(averagePoints, '#94a3b8', 1.25)
  drawLine(playerPoints, '#3b82f6', 2)

  playerPoints.forEach((point) => {
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(chartLeft, chartBottom)
  ctx.lineTo(chartRight, chartBottom)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = '7px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  TIME_INTERVALS.forEach((label, index) => {
    ctx.fillText(label, chartLeft + index * step, chartBottom + 12)
  })

  return canvas.toDataURL('image/png')
}
