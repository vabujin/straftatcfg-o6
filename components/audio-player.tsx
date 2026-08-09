"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Music2 } from "lucide-react"

const VIDEO_ID = "4bYmQYGaCq8"
const TRACK_NAME = "VHOLUME"
const ARTIST_NAME = "1000 EYES"

// Minimal typings for the YouTube IFrame API we use.
declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (v: number) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  destroy: () => void
}

export function AudioPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  // Load the YouTube IFrame API once, then build a hidden player.
  useEffect(() => {
    let cancelled = false

    const createPlayer = () => {
      if (cancelled || !containerRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          // Autoplay muted — browsers allow muted autoplay without a gesture.
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: VIDEO_ID, // required for loop to work
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            const p = e.target
            p.setVolume(60)
            setReady(true)
            // Kick off playback immediately (muted so it is allowed to start).
            p.playVideo()
            // Try to unmute right away; if the browser blocks audible autoplay,
            // the first user interaction below will unmute gracefully.
            setTimeout(() => {
              try {
                p.unMute()
                p.setVolume(60)
              } catch {
                /* stays muted until a user gesture */
              }
            }, 300)
          },
          onStateChange: (e: { data: number }) => {
            const YT = window.YT
            if (!YT) return
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
              setIsPlaying(false)
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      // Inject the API script if it isn't present yet.
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]',
      )
      if (!existing) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(tag)
      }
      // The API calls this global when it finishes loading.
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        createPlayer()
      }
    }

    // Unmute + ensure playback on the first user interaction, in case the
    // browser blocked audible autoplay on load.
    const onFirstInteraction = () => {
      const p = playerRef.current
      if (p) {
        try {
          p.unMute()
          p.setVolume(60)
          p.playVideo()
        } catch {
          /* ignore */
        }
      }
      window.removeEventListener("pointerdown", onFirstInteraction)
      window.removeEventListener("keydown", onFirstInteraction)
    }
    window.addEventListener("pointerdown", onFirstInteraction)
    window.addEventListener("keydown", onFirstInteraction)

    return () => {
      cancelled = true
      window.removeEventListener("pointerdown", onFirstInteraction)
      window.removeEventListener("keydown", onFirstInteraction)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  const toggle = () => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.unMute()
      player.setVolume(60)
      player.playVideo()
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Hidden YouTube player — audio only, never visible or interactive. */}
      <div className="pointer-events-none absolute size-px overflow-hidden opacity-0" aria-hidden="true">
        <div ref={containerRef} />
      </div>

      <div className="flex items-center gap-3 rounded-sm border border-border bg-popover/70 px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
        </button>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Music2 className="size-3 text-primary" />
            <span className="truncate">{TRACK_NAME}</span>
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {ARTIST_NAME}
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest ${
              isPlaying ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isPlaying ? "playing" : "paused"}
          </span>
        </div>
      </div>
    </div>
  )
}
