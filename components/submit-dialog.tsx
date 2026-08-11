"use client"

import { useEffect, useRef, useState } from "react"
import { X, Plus, Loader2, ImageUp } from "lucide-react"
import type { CfgConfig } from "@/lib/configs"
import { submitCommunityConfig } from "@/app/actions/community-configs"

type Props = {
  onAdd: (config: CfgConfig) => void
}

const TAG_PRESETS = ["ADHD KINGDOM", "QCW ONLY", "slow or die", "GoM"]
const MAX_TAGS = 6
const MAX_THUMBNAIL_BYTES = 4 * 1024 * 1024

export function SubmitDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [collection, setCollection] = useState("")
  const [author, setAuthor] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [weaponSpawns, setWeaponSpawns] = useState("")
  const [mapPlaylist, setMapPlaylist] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close on Escape for accessibility.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Avoid leaking the object URL created for the thumbnail preview.
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    }
  }, [thumbnailPreview])

  const reset = () => {
    setCollection("")
    setAuthor("")
    setName("")
    setDescription("")
    setWeaponSpawns("")
    setMapPlaylist("")
    setTags([])
    setTagDraft("")
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setError(null)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image file.")
      return
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      setError("Thumbnail must be smaller than 4MB.")
      return
    }

    setError(null)
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const addTag = (raw: string) => {
    const value = raw.trim().slice(0, 24)
    if (!value || tags.length >= MAX_TAGS) return
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) return
    setTags((prev) => [...prev, value])
    setTagDraft("")
  }

  const removeTag = (value: string) => {
    setTags((prev) => prev.filter((t) => t !== value))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagDraft)
    } else if (e.key === "Backspace" && !tagDraft && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error("Could not read thumbnail file."))
      reader.readAsDataURL(file)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCollection = collection.trim()
    const trimmedName = name.trim()
    if (!trimmedCollection || !trimmedName || pending) return

    setPending(true)
    setError(null)

    let thumbnailDataUrl: string | null = null
    if (thumbnailFile) {
      try {
        thumbnailDataUrl = await fileToDataUrl(thumbnailFile)
      } catch {
        setPending(false)
        setError("Could not read thumbnail image.")
        return
      }
    }

    const result = await submitCommunityConfig({
      collection: trimmedCollection,
      name: trimmedName,
      author,
      description,
      weaponPercentages: weaponSpawns,
      mapPlaylistCodes: mapPlaylist,
      genreTags: tags,
      thumbnailDataUrl,
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

              <Field label="thumbnail image">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={pending}
                  className="sr-only"
                  id="thumbnail-upload"
                />
                {thumbnailPreview ? (
                  <div className="relative flex items-center gap-3 rounded-sm border border-input bg-background/60 p-3">
                    <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-sm border border-border">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      <span className="truncate font-mono text-xs text-foreground">{thumbnailFile?.name}</span>
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                      >
                        replace
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      disabled={pending}
                      aria-label="Remove thumbnail"
                      className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="thumbnail-upload"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-input bg-background/60 px-3 py-6 text-center transition-colors hover:border-primary"
                  >
                    <ImageUp className="size-5 text-muted-foreground" />
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      click to upload from your pc
                    </span>
                    <span className="text-xs text-muted-foreground/70">PNG, JPG, WEBP up to 4MB</span>
                  </label>
                )}
              </Field>

              <Field label="weapon spawn percentages">
                <textarea
                  value={weaponSpawns}
                  onChange={(e) => setWeaponSpawns(e.target.value)}
                  placeholder={"Taser - 100 (22.6%)\nProximity mine - 81 (18.3%)\nImpetus - 72 (16.3%)\nRepulsar - 55 (12.4%)"}
                  rows={4}
                  disabled={pending}
                  className="cfg-input resize-none font-mono"
                />
              </Field>

              <Field label="map playlist codes">
                <textarea
                  value={mapPlaylist}
                  onChange={(e) => setMapPlaylist(e.target.value)}
                  placeholder={"eyJtYXBzIjpbInJvb2Z0b3AiLCJiYW5rZXIiXX0=\neyJtYXBzIjpbInNld2VyIl19"}
                  rows={4}
                  disabled={pending}
                  className="cfg-input resize-none font-mono"
                />
                <span className="text-xs text-muted-foreground/70">One base64 playlist string per line.</span>
              </Field>

              <Field label="genre tags">
                <div className="flex flex-wrap items-center gap-1.5 rounded-sm border border-input bg-background/60 p-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-sm border border-border bg-secondary px-2 py-1 font-mono text-xs uppercase tracking-wide text-secondary-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        disabled={pending}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => addTag(tagDraft)}
                    placeholder={tags.length === 0 ? "e.g. QCW ONLY" : ""}
                    disabled={pending || tags.length >= MAX_TAGS}
                    className="min-w-24 flex-1 bg-transparent px-1 py-1 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_PRESETS.filter((preset) => !tags.includes(preset)).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addTag(preset)}
                      disabled={pending || tags.length >= MAX_TAGS}
                      className="rounded-sm border border-border px-2 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
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
