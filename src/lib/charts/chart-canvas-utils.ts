export const TEAM_CHART_WIDTH = 450
export const TEAM_CHART_HEIGHT = 220

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

export function getYAxisScale(maxValue: number) {
  const max = Math.max(1, maxValue)
  const targetTicks = 6
  const roughStep = max / targetTicks

  const step =
    roughStep <= 1
      ? 1
      : roughStep <= 2
        ? 2
        : roughStep <= 5
          ? 5
          : roughStep <= 10
            ? 10
            : roughStep <= 20
              ? 20
              : Math.ceil(roughStep / 10) * 10

  const axisMax = Math.ceil(max / step) * step

  return { step, axisMax }
}

export function drawLegendItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
  style: 'circle' | 'square' = 'circle',
) {
  if (style === 'circle') {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x + 7, y + 4, 5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = color
    ctx.fillRect(x, y - 2, 10, 10)
  }

  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 11px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + 18, y + 4)
}

export function getChartArea(width: number, height: number) {
  return {
    left: 36,
    right: width - 12,
    top: 24,
    bottom: height - 28,
  }
}

export type AxisScale = {
  xStep: number
  axisMax: number
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  maxValue: number,
  area: ReturnType<typeof getChartArea>,
): AxisScale {
  const chartWidth = area.right - area.left
  const chartHeight = area.bottom - area.top
  const xStep = chartWidth / Math.max(labels.length - 1, 1)
  const { step, axisMax } = getYAxisScale(maxValue)

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.fillStyle = '#64748b'
  ctx.font = '10px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let tick = 0; tick <= axisMax; tick += step) {
    const y = area.bottom - (tick / axisMax) * chartHeight

    ctx.beginPath()
    ctx.moveTo(area.left, y)
    ctx.lineTo(area.right, y)
    ctx.stroke()

    ctx.fillText(String(tick), area.left - 4, y)
  }

  ctx.strokeStyle = '#cbd5e1'
  ctx.beginPath()
  ctx.moveTo(area.left, area.bottom)
  ctx.lineTo(area.right, area.bottom)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = '10px Helvetica, Arial, sans-serif'
  labels.forEach((label, index) => {
    ctx.fillText(label, area.left + index * xStep, area.bottom + 6)
  })

  return { xStep, axisMax }
}

export function drawValueLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
) {
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 10px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(String(value), x, y - 6)
}

export function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  width: number,
  tension = 0.4,
) {
  if (points.length < 2) return

  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index]
    const next = points[index + 1]
    const previous = points[index - 1] ?? current
    const following = points[index + 2] ?? next

    const cp1x = current.x + ((next.x - previous.x) / 6) * tension
    const cp1y = current.y + ((next.y - previous.y) / 6) * tension
    const cp2x = next.x - ((following.x - current.x) / 6) * tension
    const cp2y = next.y - ((following.y - current.y) / 6) * tension

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y)
  }

  ctx.stroke()
}

export function drawLinePoints(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
) {
  points.forEach((point) => {
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}
