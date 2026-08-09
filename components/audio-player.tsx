"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Music2 } from "lucide-react"

const TRACK_SRC = "/audio/ambient.mp3"
const TRACK_NAME = "concrete_ambient.mp3"

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState("click to play")

  // Browsers block autoplay until the user interacts with the page.
  // We attempt a muted-to-unmuted start on the first interaction anywhere.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const tryAutoplay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHint("now playing")
      } catch {
        setHint("click to play")
      }
      window.removeEventListener("pointerdown", tryAutoplay)
      window.removeEventListener("keydown", tryAutoplay)
    }

    window.addEventListener("pointerdown", tryAutoplay)
    window.addEventListener("keydown", tryAutoplay)
    return () => {
      window.removeEventListener("pointerdown", tryAutoplay)
      window.removeEventListener("keydown", tryAutoplay)
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      setHint("paused")
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
        setHint("now playing")
      } catch {
        setHint("no track loaded")
      }
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        loop
        preload="auto"
        onCanPlay={() => setReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="flex items-center gap-3 rounded-sm border border-border bg-popover/70 px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
        </button>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Music2 className="size-3 text-primary" />
            <span className="truncate">{TRACK_NAME}</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {ready ? hint : "autoplay on interaction"}
          </span>
        </div>
      </div>
    </div>
  )
}
