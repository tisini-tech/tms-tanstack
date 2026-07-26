import { getTimeInterval, sortQuarters } from './chart-quarter-utils'
import {
  TEAM_CHART_HEIGHT,
  TEAM_CHART_WIDTH,
  createCanvas,
  drawAxes,
  drawLegendItem,
  drawLinePoints,
  drawSmoothLine,
  drawValueLabel,
  getChartArea,
} from './chart-canvas-utils'
import type { ChartTeamQuarterStats, QuarterStats } from './team-quarter-types'

export async function generateLineChart(
  quarterStats: ChartTeamQuarterStats,
  label: keyof QuarterStats,
) {
  const canvas = createCanvas(TEAM_CHART_WIDTH, TEAM_CHART_HEIGHT)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const quarters = sortQuarters(Object.keys(quarterStats))
  const labels = quarters.map((quarter) => getTimeInterval(quarter))
  const values = quarters.map((quarter) => quarterStats[quarter][label] ?? 0)
  const maxValue = Math.max(1, ...values)

  const area = getChartArea(TEAM_CHART_WIDTH, TEAM_CHART_HEIGHT)
  const chartHeight = area.bottom - area.top
  const { xStep, axisMax } = drawAxes(ctx, labels, maxValue, area)

  const points = values.map((value, index) => ({
    x: area.left + index * xStep,
    y: area.bottom - (value / axisMax) * chartHeight,
  }))

  drawSmoothLine(ctx, points, '#3b82f6', 2.5, 0.4)
  drawLinePoints(ctx, points)
  points.forEach((point, index) => {
    drawValueLabel(ctx, point.x, point.y, values[index])
  })

  drawLegendItem(ctx, area.right - 130, 8, '#3b82f6', label)

  return canvas.toDataURL('image/png')
}
