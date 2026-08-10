"use client"

import { useEffect, useState } from "react"
import { X, Plus, Loader2 } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"
import { submitCommunityConfig } from "@/app/actions/community-configs"

type Props = {
  onAdd: (config: CfgConfig) => void
}

export function SubmitDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [collection, setCollection] = useState("")
  const [author, setAuthor] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape for accessibility.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const reset = () => {
    setCollection("")
    setAuthor("")
    setName("")
    setDescription("")
    setContent("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCollection = collection.trim()
    const trimmedName = name.trim()
    if (!trimmedCollection || !trimmedName || pending) return

    setPending(true)
    setError(null)

    const result = await submitCommunityConfig({
      collection: trimmedCollection,
      name: trimmedName,
      author,
      description,
      content,
    })

    setPending(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    onAdd(result.config)
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
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-sm border border-border bg-popover animate-in zoom-in-95 slide-in-from-bottom-2">
            <div className="flex items-start justify-between border-b border-border p-6 pb-5">
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

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <Field label="folder / collection name">
                <input
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="game of mines configurations"
                  required
                  disabled={pending}
                  className="cfg-input"
                />
              </Field>
              <Field label="author name(s)">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="your handle, a friend's handle"
                  disabled={pending}
                  className="cfg-input"
                />
              </Field>
              <Field label="config title">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="troll_mod.cfg"
                  required
                  disabled={pending}
                  className="cfg-input"
                />
              </Field>
              <Field label="description">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="what does it do?"
                  disabled={pending}
                  className="cfg-input"
                />
              </Field>
              <Field label="paste preset">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"weapon_pct_ak 40\nweapon_pct_awp 15\nmap_playlist_b64 eyJtYXBzIjpbXX0="}
                  rows={6}
                  disabled={pending}
                  className="cfg-input resize-none font-mono"
                />
              </Field>

              {error && <p className="font-mono text-xs text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
              >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {pending ? "adding..." : "add to hub"}
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
