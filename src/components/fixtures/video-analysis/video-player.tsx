import { useEffect, useRef } from 'react'

import { isYouTubeUrl, toYouTubeEmbedUrl } from '#/lib/video-url'
import { cn } from '#/lib/utils'

type VideoPlayerProps = {
  url: string
  /** Seek position in seconds (HTML5) / start offset (YouTube). */
  currentTime: number
  className?: string
  /** Autoplay after seeking to an event. */
  autoplay?: boolean
}

export function VideoPlayer({
  url,
  currentTime,
  className,
  autoplay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekTo = Math.max(0, currentTime)

  useEffect(() => {
    if (!videoRef.current || isYouTubeUrl(url)) return
    videoRef.current.currentTime = seekTo
    if (autoplay) {
      void videoRef.current.play().catch(() => undefined)
    }
  }, [url, seekTo, autoplay])

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
          key={embedUrl}
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
        key={url}
        src={url}
        controls
        className="absolute inset-0 size-full"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = seekTo
          }
        }}
      />
    </div>
  )
}
