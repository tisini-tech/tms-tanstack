/** Minimal YouTube IFrame API typings used by video analysis. */

export type YouTubePlayer = {
  destroy: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  getPlayerState: () => number
}

export type YouTubePlayerEvent = {
  target: YouTubePlayer
  data: number
}

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void
        onStateChange?: (event: YouTubePlayerEvent) => void
        onError?: (event: YouTubePlayerEvent) => void
      }
    },
  ) => YouTubePlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api'

let apiPromise: Promise<YouTubeNamespace> | null = null

export function loadYouTubeIframeApi(): Promise<YouTubeNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API requires a browser'))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (apiPromise) return apiPromise

  apiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      try {
        previous?.()
      } catch {
        // ignore prior callback errors
      }

      if (window.YT?.Player) {
        resolve(window.YT)
      } else {
        reject(new Error('YouTube IFrame API loaded without YT.Player'))
        apiPromise = null
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    )

    if (!existing) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.onerror = () => {
        apiPromise = null
        reject(new Error('Failed to load YouTube IFrame API'))
      }
      document.head.appendChild(script)
    } else if (window.YT?.Player) {
      resolve(window.YT)
    }
  })

  return apiPromise
}
