import { useEffect, useRef } from 'react'

import { isYouTubeUrl, toYouTubeEmbedUrl } from '#/lib/video-url'
import { cn } from '#/lib/utils'

type VideoPlayerProps = {
  url: string
  /** Seek position in seconds (HTML5) / start offset (YouTube). */
  currentTime: number
  /**
   * When set with autoplay on an HTML5 source, play until this time (seconds)
   * then pause. YouTube embeds only seek — no clip end without the IFrame API.
   */
  clipEnd?: number | null
  /** Increment to re-trigger seek/play for the same timestamps. */
  playbackKey?: number
  className?: string
  /** Autoplay after seeking to an event. */
  autoplay?: boolean
}

export function VideoPlayer({
  url,
  currentTime,
  clipEnd = null,
  playbackKey = 0,
  className,
  autoplay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekTo = Math.max(0, currentTime)

  // Seek to the clip start and play once per event click.
  useEffect(() => {
    const video = videoRef.current
    if (!video || isYouTubeUrl(url) || !url.trim() || !autoplay) return

    const playFromSeek = () => {
      void video.play().catch(() => undefined)
    }

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      playFromSeek()
    }

    video.pause()
    video.addEventListener('seeked', onSeeked)
    video.currentTime = seekTo

    // If we're already on the target frame, `seeked` may not fire.
    if (Math.abs(video.currentTime - seekTo) < 0.1) {
      video.removeEventListener('seeked', onSeeked)
      playFromSeek()
    }

    return () => {
      video.removeEventListener('seeked', onSeeked)
    }
  }, [url, seekTo, autoplay, playbackKey])

  // Watch playback time and pause when the clip end is reached.
  useEffect(() => {
    const video = videoRef.current
    if (
      !video ||
      isYouTubeUrl(url) ||
      !url.trim() ||
      !autoplay ||
      clipEnd == null ||
      !Number.isFinite(clipEnd)
    ) {
      return
    }

    const endAt = Math.max(seekTo, clipEnd)
    // Don't pause from a stale playhead until we've entered the clip window.
    let armed = false

    const onTimeUpdate = () => {
      if (!armed) {
        if (video.currentTime >= seekTo - 0.25 && video.currentTime < endAt) {
          armed = true
        }
        return
      }

      if (video.currentTime >= endAt) {
        video.pause()
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [url, seekTo, clipEnd, autoplay, playbackKey])

  if (!url.trim()) {
    return (
      <div
        className={cn(
          'relative flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground',
          className,
        )}
      >
        No video URL available
      </div>
    )
  }

  if (isYouTubeUrl(url)) {
    const embedUrl = toYouTubeEmbedUrl(url, seekTo, { autoplay })
    if (!embedUrl) {
      return (
        <div
          className={cn(
            'relative flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground',
            className,
          )}
        >
          Invalid YouTube URL
        </div>
      )
    }

    return (
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black',
          className,
        )}
      >
        <iframe
          key={`${embedUrl}-${playbackKey}`}
          src={embedUrl}
          title="Match video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black',
        className,
      )}
    >
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        className="absolute inset-0 size-full"
      />
    </div>
  )
}
