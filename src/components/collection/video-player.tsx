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
  /** Increment to move keyboard focus back to the video. */
  focusKey?: number
  /** Fired when space pauses a playing video so an event can be tagged. */
  onTag?: (timestamp: number) => void
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
  onTime,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const onTagRef = useRef(onTag)
  const onTimeRef = useRef(onTime)
  onTagRef.current = onTag
  onTimeRef.current = onTime
  const [file, setFile] = useState<File | null>(null)
  const [src, setSrc] = useState<string | null>(null)

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
    const id = window.setTimeout(() => video.focus(), 50)
    return () => window.clearTimeout(id)
  }, [focusKey])

  useEffect(() => {
    if (!src) return

    function onKeyDown(event: KeyboardEvent) {
      if (suspended) return

      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest(
          'button, a, input, textarea, select, [contenteditable="true"], [data-slot="dialog-content"]',
        )
      ) {
        return
      }

      const video = videoRef.current
      if (!video) return

      if (event.code === 'Space') {
        if (event.repeat) return
        event.preventDefault()
        if (video.paused) {
          void video.play().catch(() => undefined)
          return
        }
        video.pause()
        onTagRef.current?.(video.currentTime)
        return
      }

      if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') return

      event.preventDefault()
      const delta = event.code === 'ArrowLeft' ? -5 : 5
      const duration = Number.isFinite(video.duration) ? video.duration : Infinity
      video.currentTime = Math.min(
        Math.max(0, video.currentTime + delta),
        duration,
      )
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
          <Button type="button" onClick={() => inputRef.current?.click()}>
            <FolderOpenIcon />
            Load video
          </Button>
        </div>
      )}
    </div>
  )
}
