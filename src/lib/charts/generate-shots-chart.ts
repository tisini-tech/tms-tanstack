import { getTimeInterval, sortQuarters } from './chart-quarter-utils'
import {
  TEAM_CHART_HEIGHT,
  TEAM_CHART_WIDTH,
  createCanvas,
  drawAxes,
  drawLegendItem,
  drawLinePoints,
  drawValueLabel,
  getChartArea,
} from './chart-canvas-utils'
import type { ChartTeamQuarterStats } from './team-quarter-types'

export async function generateShotsChartImage(
  quarterStats: ChartTeamQuarterStats,
): Promise<string> {
  const canvas = createCanvas(TEAM_CHART_WIDTH, TEAM_CHART_HEIGHT)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const quarters = sortQuarters(Object.keys(quarterStats))
  const labels = quarters.map((quarter) => getTimeInterval(quarter))
  const totalShotsData = quarters.map((quarter) => quarterStats[quarter].totalShots)
  const onTargetData = quarters.map((quarter) => quarterStats[quarter].shotOnTarget)
  const maxValue = Math.max(1, ...totalShotsData, ...onTargetData)

  const area = getChartArea(TEAM_CHART_WIDTH, TEAM_CHART_HEIGHT)
  const chartHeight = area.bottom - area.top
  const { xStep, axisMax } = drawAxes(ctx, labels, maxValue, area)

  const toY = (value: number) =>
    area.bottom - (value / axisMax) * chartHeight

  const barWidth = Math.min(28, xStep * 0.45)
  const linePoints = quarters.map((_, index) => ({
    x: area.left + index * xStep,
    y: toY(totalShotsData[index]),
  }))

  quarters.forEach((_, index) => {
    const x = area.left + index * xStep
    const onTarget = onTargetData[index]
    const barHeight = (onTarget / axisMax) * chartHeight

    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x - barWidth / 2, area.bottom - barHeight, barWidth, barHeight)

    if (onTarget > 0) {
      drawValueLabel(ctx, x, area.bottom - barHeight, onTarget)
    }
  })

  if (linePoints.length > 1) {
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(linePoints[0].x, linePoints[0].y)
    linePoints.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.stroke()
  }

  drawLinePoints(ctx, linePoints)
  linePoints.forEach((point, index) => {
    drawValueLabel(ctx, point.x, point.y, totalShotsData[index])
  })

  const legendY = TEAM_CHART_HEIGHT - 16
  const legendStart = TEAM_CHART_WIDTH / 2 - 120
  drawLegendItem(ctx, legendStart, legendY, '#3b82f6', 'Total shots')
  drawLegendItem(
    ctx,
    legendStart + 120,
    legendY,
    '#94a3b8',
    'On target',
    'square',
  )

  return canvas.toDataURL('image/png')
}
