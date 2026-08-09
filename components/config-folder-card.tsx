"use client"

import { Folder, ChevronRight } from "lucide-react"

type Props = {
  name: string
  count: number
  contributors: string[]
  index: number
  onOpen: () => void
}

export function ConfigFolderCard({ name, count, contributors, index, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-sm border border-border bg-card p-5 text-left backdrop-blur-md transition-colors hover:border-primary/50 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-secondary text-primary">
          <Folder className="size-4" />
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <h3 className="mt-4 text-pretty font-mono text-base text-foreground">{name}</h3>

      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
        {count} {count === 1 ? "config" : "configs"}
      </p>

      <p className="mt-4 truncate border-t border-border pt-3 font-mono text-xs text-muted-foreground">
        by {contributors.join(", ")}
      </p>
    </button>
  )
}
