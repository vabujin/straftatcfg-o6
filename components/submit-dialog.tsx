"use client"

import { useEffect, useState } from "react"
import { X, Plus } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"

type Props = {
  onAdd: (config: CfgConfig) => void
}

export function SubmitDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")

  // Close on Escape for accessibility.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const reset = () => {
    setName("")
    setAuthor("")
    setDescription("")
    setContent("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const finalName = trimmed.endsWith(".cfg") ? trimmed : `${trimmed}.cfg`
    onAdd({
      id: `${finalName}-${Date.now()}`,
      name: finalName,
      author: author.trim() || "anonymous",
      dateAdded: new Date().toISOString(),
      description: description.trim() || "No description provided.",
      content: content.trim() || `// ${finalName}`,
    })
    reset()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Plus className="size-4" /> submit configs
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Submit a new config"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-sm border border-border bg-popover p-6 animate-in zoom-in-95 slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-mono text-lg text-foreground">submit a cfg</h2>
                <p className="mt-1 text-sm text-muted-foreground">Share a config with the lobby.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <Field label="config name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="troll_mod.cfg"
                  required
                  className="cfg-input"
                />
              </Field>
              <Field label="uploaded by">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="your handle"
                  className="cfg-input"
                />
              </Field>
              <Field label="description">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="what does it do?"
                  className="cfg-input"
                />
              </Field>
              <Field label="cfg contents (optional)">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"sv_gravity 120\nsv_headscale 4.0"}
                  rows={4}
                  className="cfg-input resize-none"
                />
              </Field>

              <button
                type="submit"
                className="mt-1 flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                add to hub
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
