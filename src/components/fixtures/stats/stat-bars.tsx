import type { ReactNode } from 'react'

const HOME = '#3498db'
const AWAY = '#e74c3c'

export function StatCard({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-border bg-card ${className ?? ''}`}>
      <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">
        {title}
      </h3>
      <div className="space-y-7 p-4">{children}</div>
    </section>
  )
}

export function PercentBar({
  hValue,
  aValue,
  stat,
}: {
  hValue: number
  aValue: number
  stat: string
}) {
  const gradient = `linear-gradient(to right, ${HOME} ${hValue}%, ${AWAY} ${hValue}% ${aValue}%)`

  return (
    <div className="flex w-full flex-col">
      <p className="text-center font-mono text-xs capitalize">{stat} %</p>
      <div className="relative h-5 overflow-hidden rounded-full">
        <div className="h-full w-full" style={{ background: gradient }} />
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-white">{hValue}</span>
          <span className="text-xs font-medium text-white">{aValue}</span>
        </div>
      </div>
    </div>
  )
}

export function HorizontalBar({
  hValue,
  aValue,
  stat,
}: {
  hValue: number
  aValue: number
  stat: string
}) {
  const total = hValue + aValue
  const homePercent = total === 0 ? 50 : Math.floor((hValue / total) * 100)
  const gradient = `linear-gradient(to right, ${HOME} ${homePercent}%, ${AWAY} ${homePercent}%)`

  return (
    <div className="flex w-full flex-col">
      <p className="text-center font-mono text-xs capitalize">{stat}</p>
      <div className="relative h-5 overflow-hidden rounded-full bg-muted">
        {total > 0 ? (
          <div className="h-full w-full" style={{ background: gradient }} />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
          <span className={total === 0 ? 'text-foreground' : undefined}>{hValue}</span>
          <span className={total === 0 ? 'text-foreground' : undefined}>{aValue}</span>
        </div>
      </div>
    </div>
  )
}

export function StatsRow({
  hValue,
  aValue,
  stat,
}: {
  hValue: number
  aValue: number
  stat: string
}) {
  return (
    <div className="flex w-full items-center bg-muted/60 font-mono">
      <div
        className="rounded-sm px-3 py-1 text-xs font-semibold text-white"
        style={{ background: HOME }}
      >
        {hValue}
      </div>
      <div className="w-4/5 truncate text-center text-xs capitalize">{stat}</div>
      <div
        className="rounded-sm px-3 py-1 text-xs font-semibold text-white"
        style={{ background: AWAY }}
      >
        {aValue}
      </div>
    </div>
  )
}

function DonutBar({
  value,
  total,
  away,
}: {
  value: number
  total: number
  away?: boolean
}) {
  const percent = total === 0 ? 0 : Math.floor((value / total) * 100)
  const radius = 36
  const strokeWidth = 7
  const circleLength = 2 * Math.PI * radius
  const strokeDashoffset = circleLength - (circleLength * percent) / 100

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={radius * 2}
        height={radius * 2}
        className="rotate-90"
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke={away ? AWAY : HOME}
          strokeWidth={strokeWidth}
          strokeDasharray={circleLength}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute flex flex-col text-foreground">
        <div className="text-center text-sm font-medium">{percent}%</div>
        <div className="text-center text-xs">
          {value}/{total}
        </div>
      </div>
    </div>
  )
}

export function RoundedBar({
  hValue,
  aValue,
  hTotal,
  aTotal,
  stat,
}: {
  hValue: number
  aValue: number
  hTotal: number
  aTotal: number
  stat: string
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <DonutBar value={hValue} total={hTotal} />
      <p className="text-center font-mono text-xs capitalize">{stat}</p>
      <DonutBar value={aValue} total={aTotal} away />
    </div>
  )
}
