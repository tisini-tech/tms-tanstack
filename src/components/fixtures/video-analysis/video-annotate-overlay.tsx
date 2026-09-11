import { useEffect, useRef } from 'react'
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from 'react-sketch-canvas'

import { cn } from '#/lib/utils'

export type VideoAnnotateOverlayProps = {
  /** When false, strokes stay visible but pointer events pass through to the video. */
  enabled: boolean
  strokeColor: string
  strokeWidth?: number
  /** Bump to clear drawings (e.g. when selecting a new event). */
  resetKey?: number
  className?: string
  canvasRef?: React.RefObject<ReactSketchCanvasRef | null>
}

export function VideoAnnotateOverlay({
  enabled,
  strokeColor,
  strokeWidth = 10,
  resetKey = 0,
  className,
  canvasRef,
}: VideoAnnotateOverlayProps) {
  const internalRef = useRef<ReactSketchCanvasRef>(null)
  const ref = canvasRef ?? internalRef

  useEffect(() => {
    ref.current?.resetCanvas()
  }, [resetKey, ref])

  useEffect(() => {
    ref.current?.eraseMode(false)
  }, [enabled, ref])

  return (
    <div
      className={cn(
        'absolute inset-0 z-10',
        enabled ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none',
        className,
      )}
      aria-hidden={!enabled}
    >
      <ReactSketchCanvas
        ref={ref}
        width="100%"
        height="100%"
        canvasColor="transparent"
        backgroundImage=""
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        eraserWidth={16}
        className="h-full w-full"
        style={{
          border: 'none',
          borderRadius: 0,
          background: 'transparent',
        }}
      />
    </div>
  )
}
