import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon, RulerIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { addPlayerMeasurementsFn } from '#/data/players'
import type { Player, TeamPlayer } from '#/lib/types'

function parseMeasurementInput(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0 ? String(n) : trimmed
}

export function formatPlayerMeasurements(
  player: Pick<Player, 'height' | 'weight'>,
) {
  const parts: string[] = []
  const height = player.height?.trim()
  const weight = player.weight?.trim()

  if (height) parts.push(`${height} cm`)
  if (weight) parts.push(`${weight} kg`)

  return parts.length > 0 ? parts.join(' · ') : null
}

export function PlayerMeasurementsDialog({ entry }: { entry: TeamPlayer }) {
  const router = useRouter()
  const player = entry.player
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [height, setHeight] = useState(() =>
    parseMeasurementInput(player.height),
  )
  const [weight, setWeight] = useState(() =>
    parseMeasurementInput(player.weight),
  )

  const name = player.name || 'this player'

  function resetForm() {
    setError(null)
    setHeight(parseMeasurementInput(player.height))
    setWeight(parseMeasurementInput(player.weight))
  }

  async function handleSave() {
    setError(null)

    const heightValue = Number(height.trim())
    const weightValue = Number(weight.trim())

    if (!Number.isFinite(heightValue) || heightValue <= 0) {
      setError('Enter a valid height in centimetres.')
      return
    }

    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      setError('Enter a valid weight in kilograms.')
      return
    }

    setIsLoading(true)
    try {
      await addPlayerMeasurementsFn({
        data: {
          playerId: String(entry.player.id),
          height: heightValue,
          weight: weightValue,
        },
      })
      await router.invalidate()
      setOpen(false)
      resetForm()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to save player measurements',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          resetForm()
        } else {
          setError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Record measurements for ${name}`}
            title="Record height & weight"
          />
        }
      >
        <RulerIcon className="size-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record measurements</DialogTitle>
          <DialogDescription>
            Log height and weight for{' '}
            <span className="font-medium text-foreground">{name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field className="gap-2">
            <FieldLabel htmlFor={`player-measurements-height-${entry.id}`}>
              Height (cm)
            </FieldLabel>
            <Input
              id={`player-measurements-height-${entry.id}`}
              type="number"
              min={1}
              step="0.1"
              inputMode="decimal"
              placeholder="182"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="h-10 rounded-xl px-3"
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor={`player-measurements-weight-${entry.id}`}>
              Weight (kg)
            </FieldLabel>
            <Input
              id={`player-measurements-weight-${entry.id}`}
              type="number"
              min={1}
              step="0.1"
              inputMode="decimal"
              placeholder="78"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="h-10 rounded-xl px-3"
            />
          </Field>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => {
              void handleSave()
            }}
          >
            {isLoading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Saving…
              </>
            ) : (
              'Save measurements'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
