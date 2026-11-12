import { type MouseEvent, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '#/components/ui/dialog'

/** Length of the pitch, left goal to right goal. */
const PITCH_LENGTH = 100
/** Width of the pitch, top touchline to bottom touchline. */
const PITCH_WIDTH = 68
/** In-goal depth drawn beyond each rugby goal line. */
const RUGBY_IN_GOAL = 10
/**
 * Goal lines on rugby-pitch.jpg, as a fraction of the image width.
 * The posts sit on these lines; the field between them stays 0–100.
 */
const RUGBY_LEFT_GOAL = 506 / 4136
const RUGBY_RIGHT_GOAL = 3631 / 4136

export type PitchPoint = {
  x: number
  y: number
}

type PitchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sport: 'football' | 'rugby'
  onMark: (point: PitchPoint) => void
}

type Mark = PitchPoint & {
  left: number
  top: number
}

function roundTo(value: number, places: number) {
  const scale = 10 ** places
  return Math.round(value * scale) / scale
}

function pitchX(ratio: number, sport: 'football' | 'rugby') {
  if (sport !== 'rugby') return ratio * PITCH_LENGTH
  if (ratio <= RUGBY_LEFT_GOAL) {
    return -RUGBY_IN_GOAL * (1 - ratio / RUGBY_LEFT_GOAL)
  }
  if (ratio >= RUGBY_RIGHT_GOAL) {
    const span = (ratio - RUGBY_RIGHT_GOAL) / (1 - RUGBY_RIGHT_GOAL)
    return PITCH_LENGTH + span * RUGBY_IN_GOAL
  }
  const span =
    (ratio - RUGBY_LEFT_GOAL) / (RUGBY_RIGHT_GOAL - RUGBY_LEFT_GOAL)
  return span * PITCH_LENGTH
}

/** Halves played toward the opposite goal. */
const SWITCHED_ENDS = new Set(['secondhalf', 'extrasecond'])

/** Store a click in the first-half attacking direction. */
export function storedPitchPoint(
  point: PitchPoint,
  moment: string,
): PitchPoint {
  if (!SWITCHED_ENDS.has(moment)) return point
  return {
    x: roundTo(PITCH_LENGTH - point.x, 1),
    y: roundTo(PITCH_WIDTH - point.y, 1),
  }
}

export default function PitchModal({
  open,
  onOpenChange,
  sport,
  onMark,
}: PitchModalProps) {
  const [mark, setMark] = useState<Mark | null>(null)
  const src = sport === 'rugby' ? '/rugby-pitch.jpg' : '/football-pitch.jpg'

  function place(event: MouseEvent<HTMLImageElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const xRatio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    )
    const yRatio = Math.min(
      1,
      Math.max(0, (event.clientY - rect.top) / rect.height),
    )
    const next = {
      x: roundTo(pitchX(xRatio, sport), 1),
      y: roundTo(yRatio * PITCH_WIDTH, 1),
      left: xRatio * 100,
      top: yRatio * 100,
    }

    setMark(next)
    onMark({ x: next.x, y: next.y })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setMark(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="flex w-[min(56rem,calc(100%-2rem))] max-w-none flex-col gap-3 p-4 sm:max-w-none">
        <DialogTitle>Mark the location</DialogTitle>
        <p className="text-xs text-muted-foreground">
          {sport === 'rugby'
            ? `Click the pitch. X runs -${RUGBY_IN_GOAL}–${PITCH_LENGTH + RUGBY_IN_GOAL}. The goal lines are 0 and ${PITCH_LENGTH}, and the in-goal areas outside them reach -${RUGBY_IN_GOAL} and ${PITCH_LENGTH + RUGBY_IN_GOAL}. Y runs 0–${PITCH_WIDTH} from the top touchline to the bottom.`
            : `Click the pitch. X runs 0–${PITCH_LENGTH} from the left goal to the right goal. Y runs 0–${PITCH_WIDTH} from the top touchline to the bottom.`}
        </p>

        <div className="relative">
          <img
            src={src}
            alt={sport === 'rugby' ? 'Rugby pitch' : 'Football pitch'}
            draggable={false}
            onClick={place}
            className="w-full cursor-crosshair select-none rounded-md"
          />
          {mark ? (
            <span
              className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow"
              style={{ left: `${mark.left}%`, top: `${mark.top}%` }}
            />
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
