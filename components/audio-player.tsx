"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Music2 } from "lucide-react"

const VIDEO_ID = "4bYmQYGaCq8"
const TRACK_NAME = "concrete_ambient.yt"

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
  destroy: () => void
}

export function AudioPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState("loading…")

  // Load the YouTube IFrame API once, then build a hidden player.
  useEffect(() => {
    let cancelled = false

    const createPlayer = () => {
      if (cancelled || !containerRef.current || !window.YT) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          loop: 1,
          playlist: VIDEO_ID, // required for loop to work
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.setVolume(60)
            setReady(true)
            setHint("click to play")
          },
          onStateChange: (e: { data: number }) => {
            const YT = window.YT
            if (!YT) return
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              setHint("now playing")
            } else if (e.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false)
              setHint("paused")
            } else if (e.data === YT.PlayerState.ENDED) {
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

    return () => {
      cancelled = true
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
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {ready ? hint : "loading player"}
          </span>
        </div>
      </div>
    </div>
  )
}
