"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { seedConfigs, type CfgConfig } from "@/lib/configs"
import { ConfigCard } from "@/components/config-card"
import { SubmitDialog } from "@/components/submit-dialog"

export function CfgHub() {
  const [configs, setConfigs] = useState<CfgConfig[]>(seedConfigs)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return configs
    return configs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [configs, query])

  const handleAdd = (config: CfgConfig) => setConfigs((prev) => [config, ...prev])

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-primary">// the hub</h2>
          <p className="mt-1 text-2xl text-foreground">{filtered.length} configs available</p>
        </div>
        <SubmitDialog onAdd={handleAdd} />
      </div>

      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search configs, authors..."
          className="cfg-input pl-9"
          aria-label="Search configs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-mono text-sm text-muted-foreground">
          no configs match &quot;{query}&quot;
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((config, i) => (
            <ConfigCard key={config.id} config={config} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
