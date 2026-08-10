"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Music2 } from "lucide-react"

const YOUTUBE_VIDEO_ID = "4bYmQYGaCq8"
const TRACK_TITLE = "VHOLUME"
const ARTIST_NAME = "1000 EYES"

// Minimal shape of the bits of the YouTube IFrame API we actually use.
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  setVolume: (v: number) => void
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: (event: { target: YouTubePlayer }) => void
        onStateChange?: (event: { data: number }) => void
      }
    },
  ) => YouTubePlayer
  PlayerState: { PLAYING: number; PAUSED: number }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export function AudioPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    function createPlayer() {
      if (cancelled || !containerRef.current || !window.YT) return

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: { target: YouTubePlayer }) => {
            setReady(true)
            // Autoplay is far more reliable muted; unmute right after so audio
            // still plays for users whose browser permits it.
            event.target.mute()
            event.target.playVideo()
            window.setTimeout(() => {
              try {
                event.target.unMute()
                event.target.setVolume(35)
              } catch {
                // Ignore — browser blocked unmute, stays muted until user toggles.
              }
            }, 300)
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT?.PlayerState.PLAYING) setIsPlaying(true)
            if (event.data === window.YT?.PlayerState.PAUSED) setIsPlaying(false)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      const existingCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        existingCallback?.()
        createPlayer()
      }

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script")
        script.id = "youtube-iframe-api"
        script.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(script)
      }
    }
    window.addEventListener("pointerdown", onFirstInteraction)
    window.addEventListener("keydown", onFirstInteraction)

    return () => {
      cancelled = true
    }
  }, [])

  const toggle = () => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.unMute()
      player.playVideo()
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Hidden YouTube iframe used purely as a background audio source. */}
      <div ref={containerRef} className="absolute size-px overflow-hidden opacity-0" aria-hidden="true" />

      <div className="flex items-center gap-3 rounded-sm border border-border bg-popover/70 px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
        </button>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Music2 className="size-3 text-primary" />
            <span className="truncate">{TRACK_TITLE}</span>
          </span>
          <span className="truncate font-mono text-[10px] text-muted-foreground">{ARTIST_NAME}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {ready ? (isPlaying ? "playing" : "paused") : "loading"}
          </span>
        </div>
      </div>
    </div>
  )
}
