import {
  EraserIcon,
  HighlighterIcon,
  RotateCcwIcon,
  Undo2Icon,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export const ANNOTATE_COLORS = [
  { id: 'yellow', label: 'Yellow', value: 'rgba(250, 204, 21, 0.7)' },
  { id: 'red', label: 'Red', value: 'rgba(239, 68, 68, 0.75)' },
  { id: 'lime', label: 'Lime', value: 'rgba(132, 204, 22, 0.7)' },
  { id: 'white', label: 'White', value: 'rgba(255, 255, 255, 0.85)' },
] as const

export type AnnotateColorId = (typeof ANNOTATE_COLORS)[number]['id']

type VideoAnnotateToolbarProps = {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  colorId: AnnotateColorId
  onColorChange: (colorId: AnnotateColorId) => void
  erasing: boolean
  onErasingChange: (erasing: boolean) => void
  onUndo: () => void
  onClear: () => void
}

export function VideoAnnotateToolbar({
  enabled,
  onEnabledChange,
  colorId,
  onColorChange,
  erasing,
  onErasingChange,
  onUndo,
  onClear,
}: VideoAnnotateToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={enabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onEnabledChange(!enabled)}
        aria-pressed={enabled}
      >
        <HighlighterIcon className="size-4" data-icon="inline-start" />
        {enabled ? 'Annotating' : 'Annotate'}
      </Button>

      {enabled ? (
        <>
          <div className="flex items-center gap-1.5">
            {ANNOTATE_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={colorId === color.id && !erasing}
                onClick={() => {
                  onErasingChange(false)
                  onColorChange(color.id)
                }}
                className={cn(
                  'size-6 rounded-full border-2 transition-transform',
                  colorId === color.id && !erasing
                    ? 'scale-110 border-foreground'
                    : 'border-transparent opacity-80 hover:opacity-100',
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>

          <Button
            type="button"
            variant={erasing ? 'default' : 'outline'}
            size="sm"
            onClick={() => onErasingChange(!erasing)}
            aria-pressed={erasing}
          >
            <EraserIcon className="size-4" data-icon="inline-start" />
            Eraser
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onUndo}>
            <Undo2Icon className="size-4" data-icon="inline-start" />
            Undo
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            <RotateCcwIcon className="size-4" data-icon="inline-start" />
            Clear
          </Button>
        </>
      ) : null}
    </div>
  )
}
