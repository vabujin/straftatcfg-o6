"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Search } from "lucide-react"
import { seedConfigs, type CfgConfig } from "@/lib/configs"
import { getCommunityConfigs } from "@/app/actions/community-configs"
import { ConfigCard } from "@/components/config-card"
import { SubmitDialog } from "@/components/submit-dialog"

type Tab = "verified" | "community"

const TABS: { id: Tab; label: string }[] = [
  { id: "verified", label: "SOME CONFIGS THAT WE CONSIDER GOOD" },
  { id: "community", label: "COMMUNITY CONFIGS" },
]

export function CfgHub({ initialCommunityConfigs }: { initialCommunityConfigs: CfgConfig[] }) {
  const [tab, setTab] = useState<Tab>("verified")
  const [query, setQuery] = useState("")

  const { data: communityConfigs = [], mutate } = useSWR<CfgConfig[]>("community-configs", getCommunityConfigs, {
    fallbackData: initialCommunityConfigs,
    revalidateOnFocus: false,
  })

  const activeConfigs = tab === "verified" ? seedConfigs : communityConfigs

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activeConfigs
    return activeConfigs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [activeConfigs, query])

  const handleAdd = (config: CfgConfig) => {
    mutate((current) => [config, ...(current ?? [])], { revalidate: false })
    setTab("community")
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-primary">// the hub</h2>
          <p className="mt-1 text-2xl text-foreground">{filtered.length} configs available</p>
        </div>
        <SubmitDialog onAdd={handleAdd} />
      </div>

      <div
        role="tablist"
        aria-label="Config categories"
        className="mb-6 flex flex-col gap-2 border-b border-border sm:flex-row"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative -mb-px flex items-center gap-2 px-1 py-3 text-left font-mono text-xs uppercase tracking-widest transition-colors sm:px-3 ${
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id === "community" && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {communityConfigs.length}
              </span>
            )}
            {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-px bg-primary" aria-hidden="true" />}
          </button>
        ))}
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
          {query
            ? `no configs match "${query}"`
            : tab === "community"
              ? "no community configs yet. be the first to submit one."
              : "no configs found."}
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
