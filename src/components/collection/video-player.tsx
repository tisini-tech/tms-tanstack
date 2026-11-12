import { useEffect, useRef, useState } from 'react'
import { FolderOpenIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type VideoPlayerProps = {
  /** Seek position in seconds. Applied when `seekKey` changes. */
  seekTo?: number | null
  seekKey?: number
  className?: string
  /** Ignore keyboard shortcuts while the tagging modal is open. */
  suspended?: boolean
  /** Increment to focus the video and resume playback. */
  focusKey?: number
  /** Fired when space pauses a playing video so an event can be tagged. */
  onTag?: (timestamp: number) => void
  /** When false, space keeps playback and does not open tagging. */
  canTag?: boolean
  /** Fired when space would tag but `canTag` is false. */
  onTagBlocked?: () => void
  /** Current video position in seconds. */
  onTime?: (seconds: number) => void
}

export default function VideoPlayer({
  seekTo = null,
  seekKey = 0,
  className,
  suspended = false,
  focusKey = 0,
  onTag,
  canTag = true,
  onTagBlocked,
  onTime,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const onTagRef = useRef(onTag)
  const onTimeRef = useRef(onTime)
  const canTagRef = useRef(canTag)
  const onTagBlockedRef = useRef(onTagBlocked)
  onTagRef.current = onTag
  onTimeRef.current = onTime
  canTagRef.current = canTag
  onTagBlockedRef.current = onTagBlocked
  const [file, setFile] = useState<File | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [seekStep, setSeekStep] = useState('2')
  const seekStepRef = useRef(2)
  const parsedStep = Number(seekStep)
  seekStepRef.current =
    Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : 2

  useEffect(() => {
    if (!file) {
      setSrc(null)
      return
    }
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const report = () => onTimeRef.current?.(video.currentTime)
    video.addEventListener('timeupdate', report)
    video.addEventListener('seeked', report)
    video.addEventListener('pause', report)
    return () => {
      video.removeEventListener('timeupdate', report)
      video.removeEventListener('seeked', report)
      video.removeEventListener('pause', report)
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || seekTo == null || !src) return
    video.currentTime = Math.max(0, seekTo)
    void video.play().catch(() => undefined)
  }, [seekTo, seekKey, src])

  useEffect(() => {
    if (!focusKey) return
    const video = videoRef.current
    if (!video) return
    const id = window.setTimeout(() => {
      video.focus()
      void video.play().catch(() => undefined)
    }, 50)
    return () => window.clearTimeout(id)
  }, [focusKey])

  useEffect(() => {
    if (!src) return

    function onKeyDown(event: KeyboardEvent) {
      if (suspended) return

      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        Boolean(
          target.closest(
            'input, textarea, select, [contenteditable="true"], [data-slot="dialog-content"]',
          ),
        )
      if (typing) return

      const video = videoRef.current
      if (!video) return

      if (
        event.code === 'KeyR' &&
        !event.repeat &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault()
        event.stopPropagation()
        video.focus()
        return
      }

      if (target instanceof HTMLElement && target.closest('button, a')) return

      if (event.code === 'Space') {
        if (event.repeat) return
        event.preventDefault()
        event.stopPropagation()
        if (video.paused) {
          void video.play().catch(() => undefined)
          return
        }
        if (!canTagRef.current) {
          onTagBlockedRef.current?.()
          return
        }
        video.pause()
        onTagRef.current?.(video.currentTime)
        return
      }

      if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') return

      event.preventDefault()
      event.stopPropagation()
      const step = seekStepRef.current
      const delta = event.code === 'ArrowLeft' ? -step : step
      const duration = Number.isFinite(video.duration) ? video.duration : Infinity
      video.currentTime = Math.min(
        Math.max(0, video.currentTime + delta),
        duration,
      )
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [src, suspended])

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-black',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null
          if (next) setFile(next)
          event.target.value = ''
        }}
      />

      {src ? (
        <>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-xs text-white/80">
            <span className="min-w-0 truncate">{file?.name}</span>
            <span className="shrink-0 text-white/50" title="Return keyboard focus to the video">
              R focus
            </span>
            <label className="flex shrink-0 items-center gap-1">
              Seek
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                aria-label="Seek step in seconds"
                value={seekStep}
                onChange={(event) => setSeekStep(event.target.value)}
                className="h-6 w-12 rounded-md border border-border bg-background px-1.5 text-xs text-foreground tabular-nums scheme-dark"
              />
              s
            </label>
            <Button
              type="button"
              size="xs"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Change video
            </Button>
          </div>
          <video
            ref={videoRef}
            src={src}
            controls
            tabIndex={-1}
            className="min-h-0 w-full flex-1 bg-black outline-none"
          />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-white/70">Click play to select a file</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            <FolderOpenIcon />
            Load video
          </Button>
        </div>
      )}
    </div>
  )
}
