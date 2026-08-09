"use client"

import { useState } from "react"
import { Check, Copy, Download, User, Calendar } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function ConfigCard({ config, index }: { config: CfgConfig; index: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(config.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard may be blocked; fail silently.
    }
  }

  const handleDownload = () => {
    const blob = new Blob([config.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = config.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <article
      className="group flex flex-col rounded-sm border border-border bg-card p-5 backdrop-blur-md transition-colors hover:border-primary/50 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-base text-foreground">
          <span className="text-primary">$</span> {config.name}
        </h3>
        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
      </div>

      <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{config.description}</p>

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
  )
}
