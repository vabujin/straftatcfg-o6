"use client"

import { useState } from "react"
import { Check, Copy, Download, User, Calendar, ShieldCheck } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"
import { ConfigDetailModal } from "@/components/config-detail-modal"
import { resolveConfigFields } from "@/lib/config-parsers"

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export function ConfigCard({
  config,
  index,
  verified = false,
}: {
  config: CfgConfig
  index: number
  verified?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const { genreTags, weaponPercentagesRaw, mapPlaylistCodesRaw } = resolveConfigFields(config)
  const [imgLoaded, setImgLoaded] = useState(false)

  const buildPayload = () => {
    if (config.content.trim()) {
      return config.content.trim()
    }

    return [
      weaponPercentagesRaw && `[WEAPON SPAWN PERCENTAGES]\n${weaponPercentagesRaw}`,
      mapPlaylistCodesRaw && `[MAP PLAYLIST CODES]\n${mapPlaylistCodesRaw}`,
      genreTags.length > 0 && `[GENRE TAGS]\n${genreTags.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n")
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(buildPayload())
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard may be blocked; fail silently.
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const payload = buildPayload()
    const blob = new Blob([payload], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = config.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setDetailOpen(true)
          }
        }}
        className="group flex cursor-pointer flex-col rounded-sm border border-border bg-card p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50"
        style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
      >
        {config.thumbnailUrl && (
          <div className="relative mb-4 overflow-hidden rounded-sm border border-border bg-secondary/60">
            <div className="relative aspect-video w-full overflow-hidden">
              {!imgLoaded && <div className="absolute inset-0 bg-secondary/60 animate-pulse" />}
              <img
                src={config.thumbnailUrl}
                alt=""
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
                className={`h-full w-full object-cover transition-opacity duration-500 group-hover:scale-[1.02] ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-mono text-base text-foreground">
            <span className="text-primary">$</span> {config.name}
          </h3>
          {verified ? (
            <span
              className="flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary"
              title="Verified config"
            >
              <ShieldCheck className="size-3" /> verified
            </span>
          ) : (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
          )}
        </div>

        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{config.description}</p>

        {genreTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {genreTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-border bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3" /> {config.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3" /> {formatDate(config.dateAdded)}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 font-mono text-xs uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "copied" : "copy"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Download ${config.name}`}
            className="flex items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      </article>

      <ConfigDetailModal
        config={config}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        verified={verified}
      />
    </>
  )
}
