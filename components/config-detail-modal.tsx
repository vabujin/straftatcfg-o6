"use client"

import { useEffect, useState } from "react"
import { X, Check, Copy, User, Calendar, ShieldCheck } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"
import { resolveConfigFields } from "@/lib/config-parsers"

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

type Props = {
  config: CfgConfig
  open: boolean
  onClose: () => void
  verified?: boolean
}

export function ConfigDetailModal({ config, open, onClose, verified = false }: Props) {
  const { weapons, maps, genreTags, weaponPercentagesRaw, mapPlaylistCodesRaw } = resolveConfigFields(config)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [copiedMapIndex, setCopiedMapIndex] = useState<number | null>(null)
  const [copiedPayload, setCopiedPayload] = useState(false)
  const [copiedAllCodes, setCopiedAllCodes] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setCopiedMapIndex(null)
      setCopiedPayload(false)
      setCopiedAllCodes(false)
    }
  }, [open])

  if (!open) return null

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

  const copyToClipboard = async (value: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(value)
      onSuccess()
    } catch {
      // Clipboard may be blocked; fail silently.
    }
  }

  const copyMapCode = async (code: string, index: number) => {
    await copyToClipboard(code, () => {
      setCopiedMapIndex(index)
      setTimeout(() => setCopiedMapIndex(null), 1600)
    })
  }

  const copyPayload = async () => {
    await copyToClipboard(buildPayload(), () => {
      setCopiedPayload(true)
      setTimeout(() => setCopiedPayload(false), 1600)
    })
  }

  const copyAllCodes = async () => {
    await copyToClipboard(maps.join("\n"), () => {
      setCopiedAllCodes(true)
      setTimeout(() => setCopiedAllCodes(false), 1600)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Config details for ${config.name}`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-border bg-popover animate-in zoom-in-95 slide-in-from-bottom-2">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-lg text-foreground">
                <span className="text-primary">$</span> {config.name}
              </h2>
              {verified && (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  <ShieldCheck className="size-3" /> verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-3" /> {config.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3" /> {formatDate(config.dateAdded)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
          {config.thumbnailUrl && (
            <div className="overflow-hidden rounded-sm border border-border bg-secondary/60">
              <div className="relative aspect-video w-full overflow-hidden">
                {!imgLoaded && <div className="absolute inset-0 bg-secondary/60 animate-pulse" />}
                <img
                  src={config.thumbnailUrl}
                  alt={`${config.name} thumbnail`}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-500 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPayload}
              className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
            >
              {copiedPayload ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copiedPayload ? "payload copied" : "copy payload"}
            </button>
            {maps.length > 0 && (
              <button
                type="button"
                onClick={copyAllCodes}
                className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
              >
                {copiedAllCodes ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedAllCodes ? "codes copied" : "copy base64 codes"}
              </button>
            )}
          </div>

          <section>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">match settings</h3>
            <div className="rounded-sm border border-border bg-background/40 p-3 font-mono text-sm text-foreground/90">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                <span className="text-muted-foreground">collection</span>
                <span>{config.collection}</span>
              </div>
              <div className="mt-2">
                <div className="text-muted-foreground">rules & notes</div>
                <p className="mt-1 leading-relaxed text-foreground/80">{config.description}</p>
              </div>
            </div>
          </section>

          {genreTags.length > 0 && (
            <section>
              <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">genre tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {genreTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-border bg-secondary px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {weapons.length > 0 && (
            <section>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">weapon data</h3>
              <ul className="flex flex-col gap-3">
                {weapons.map((weapon) => (
                  <li key={weapon.name} className="rounded-sm border border-border bg-background/40 p-3">
                    <div className="mb-2 flex items-baseline justify-between gap-2 font-mono text-sm">
                      <span className="text-foreground">{weapon.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {weapon.count !== undefined ? `${weapon.count} · ` : ""}
                        {weapon.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-sm border border-border bg-secondary">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, weapon.percentage))}%` }}
                        role="progressbar"
                        aria-valuenow={weapon.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${weapon.name} spawn rate ${weapon.percentage}%`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {maps.length > 0 && (
            <section>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">base64 map codes</h3>
              <ul className="flex flex-col gap-3">
                {maps.map((code, index) => (
                  <li key={`${index}-${code.slice(0, 12)}`} className="rounded-sm border border-border bg-background/40 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        playlist {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyMapCode(code, index)}
                        aria-label={`Copy playlist ${index + 1}`}
                        className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
                      >
                        {copiedMapIndex === index ? (
                          <>
                            <Check className="size-3" /> copied!
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" /> copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre
                      onClick={() => copyMapCode(code, index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          copyMapCode(code, index)
                        }
                      }}
                      className="cursor-pointer overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-foreground/90 hover:bg-background/50 p-1"
                      aria-label={`Base64 playlist ${index + 1}, click to copy`}
                    >
                      {code}
                    </pre>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">preset body</h3>
            <pre
              onClick={copyPayload}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  copyPayload()
                }
              }}
              className="cursor-pointer overflow-x-auto whitespace-pre-wrap rounded-sm border border-border bg-background/40 p-3 font-mono text-xs leading-relaxed text-foreground/90 hover:bg-background/50"
              aria-label="Preset body, click to copy"
            >
              {buildPayload()}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">Click any code or the preset body to copy it to clipboard.</p>
          </section>

          {weapons.length === 0 && maps.length === 0 && genreTags.length === 0 && !config.thumbnailUrl && (
            <p className="py-8 text-center font-mono text-sm text-muted-foreground">
              no structured preset data available for this config.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
