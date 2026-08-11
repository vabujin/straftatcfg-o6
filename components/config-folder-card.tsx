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
      className="group relative flex min-h-44 flex-col rounded-sm border border-border/60 bg-card/40 p-5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/60"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-secondary/50 text-primary">
          <Folder className="size-4" />
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <h3 className="mt-4 text-pretty font-mono text-base text-foreground">{name}</h3>

      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
        {count} {count === 1 ? "config" : "configs"}
      </p>

      <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-sm border border-border/50 bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground/90 backdrop-blur-sm">
        by {contributors.join(", ")}
      </span>
    </button>
  )
}
