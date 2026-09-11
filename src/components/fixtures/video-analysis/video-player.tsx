import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'

import { VideoAnnotateOverlay } from '#/components/fixtures/video-analysis/video-annotate-overlay'
import { extractYouTubeId, isYouTubeUrl } from '#/lib/video-url'
import {
  loadYouTubeIframeApi,
  type YouTubePlayer,
} from '#/lib/youtube-iframe-api'
import { cn } from '#/lib/utils'

type VideoPlayerProps = {
  url: string
  /** Seek position in seconds (HTML5) / start offset (YouTube). */
  currentTime: number
  /**
   * When set with autoplay, play until this time (seconds) then pause.
   * Works for HTML5 video and YouTube (IFrame API).
   */
  clipEnd?: number | null
  /** Increment to re-trigger seek/play for the same timestamps. */
  playbackKey?: number
  className?: string
  /** Autoplay after seeking to an event. */
  autoplay?: boolean
  /** Enable highlighter drawing over the video. */
  annotating?: boolean
  annotateStrokeColor?: string
  annotateResetKey?: number
  annotateCanvasRef?: RefObject<ReactSketchCanvasRef | null>
}

export function VideoPlayer({
  url,
  currentTime,
  clipEnd = null,
  playbackKey = 0,
  className,
  autoplay = false,
  annotating = false,
  annotateStrokeColor = 'rgba(250, 204, 21, 0.7)',
  annotateResetKey = 0,
  annotateCanvasRef,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const seekTo = Math.max(0, currentTime)

  // Seek to the clip start and play once per event click (HTML5).
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

    if (Math.abs(video.currentTime - seekTo) < 0.1) {
      video.removeEventListener('seeked', onSeeked)
      playFromSeek()
    }

    return () => {
      video.removeEventListener('seeked', onSeeked)
    }
  }, [url, seekTo, autoplay, playbackKey])

  // Watch playback time and pause when the clip end is reached (HTML5).
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

  const overlay = (
    <VideoAnnotateOverlay
      enabled={annotating}
      strokeColor={annotateStrokeColor}
      resetKey={annotateResetKey}
      canvasRef={annotateCanvasRef}
    />
  )

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
    const videoId = extractYouTubeId(url)
    if (!videoId) {
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
      <PlayerFrame className={className} overlay={overlay}>
        <YouTubeClipPlayer
          videoId={videoId}
          seekTo={seekTo}
          clipEnd={clipEnd}
          autoplay={autoplay}
          playbackKey={playbackKey}
        />
      </PlayerFrame>
    )
  }

  return (
    <PlayerFrame className={className} overlay={overlay}>
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        className="absolute inset-0 size-full"
      />
    </PlayerFrame>
  )
}

function YouTubeClipPlayer({
  videoId,
  seekTo,
  clipEnd,
  autoplay,
  playbackKey,
}: {
  videoId: string
  seekTo: number
  clipEnd: number | null
  autoplay: boolean
  playbackKey: number
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const readyRef = useRef(false)
  const pollRef = useRef<number | null>(null)
  const clipRef = useRef({ seekTo, clipEnd, autoplay, playbackKey })
  clipRef.current = { seekTo, clipEnd, autoplay, playbackKey }

  const clearPoll = () => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const applyClip = (player: YouTubePlayer) => {
    const {
      seekTo: startAt,
      clipEnd: end,
      autoplay: shouldPlay,
    } = clipRef.current

    clearPoll()

    try {
      player.seekTo(startAt, true)
    } catch {
      return
    }

    if (!shouldPlay) {
      try {
        player.pauseVideo()
      } catch {
        // ignore
      }
      return
    }

    try {
      // Event click is a user gesture; unmuted play usually works.
      player.unMute()
      player.playVideo()
    } catch {
      try {
        player.mute()
        player.playVideo()
      } catch {
        return
      }
    }

    if (end == null || !Number.isFinite(end)) return

    const endAt = Math.max(startAt, end)
    let armed = false

    pollRef.current = window.setInterval(() => {
      let time = 0
      try {
        time = player.getCurrentTime()
      } catch {
        return
      }

      if (!armed) {
        if (time >= startAt - 0.25 && time < endAt) {
          armed = true
        }
        return
      }

      if (time >= endAt) {
        try {
          player.pauseVideo()
          player.seekTo(endAt, true)
        } catch {
          // ignore
        }
        clearPoll()
      }
    }, 100)
  }

  // Create / recreate the YT player when the video id changes.
  useEffect(() => {
    let cancelled = false
    let player: YouTubePlayer | null = null

    readyRef.current = false
    playerRef.current = null
    clearPoll()

    const host = hostRef.current
    if (!host) return

    // YT.Player replaces the host node; keep a stable child target.
    host.replaceChildren()
    const mount = document.createElement('div')
    mount.className = 'size-full'
    host.appendChild(mount)

    void loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !mount.isConnected) return

        player = new YT.Player(mount, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return
              readyRef.current = true
              playerRef.current = event.target
              applyClip(event.target)
            },
          },
        })
        playerRef.current = player
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      readyRef.current = false
      clearPoll()
      try {
        player?.destroy()
      } catch {
        // ignore
      }
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyClip reads latest clip via ref
  }, [videoId])

  // Re-apply seek / clip whenever the selected event changes.
  useEffect(() => {
    const player = playerRef.current
    if (!player || !readyRef.current) return
    applyClip(player)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo, clipEnd, autoplay, playbackKey, videoId])

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 size-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full"
    />
  )
}

function PlayerFrame({
  className,
  children,
  overlay,
}: {
  className?: string
  children: ReactNode
  overlay: ReactNode
}) {
  return (
    <div
      className={cn(
        'relative aspect-video w-full max-h-full overflow-hidden rounded-xl border border-border bg-black',
        className,
      )}
    >
      {children}
      {overlay}
    </div>
  )
}
