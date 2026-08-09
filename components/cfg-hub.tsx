"use client"

import { useMemo, useState } from "react"
import { Search, ShieldCheck, Users } from "lucide-react"
import { verifiedConfigs, communitySeedConfigs, type CfgConfig } from "@/lib/configs"
import { ConfigCard } from "@/components/config-card"
import { SubmitDialog } from "@/components/submit-dialog"

type Tab = "verified" | "community"

export function CfgHub() {
  const [tab, setTab] = useState<Tab>("verified")
  const [community, setCommunity] = useState<CfgConfig[]>(communitySeedConfigs)
  const [query, setQuery] = useState("")

  // The verified list is a hardcoded constant, so it is never mutated here.
  const source = tab === "verified" ? verifiedConfigs : community

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [source, query])

  const handleAdd = (config: CfgConfig) => setCommunity((prev) => [config, ...prev])

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-primary">// the hub</h2>
          <p className="mt-1 text-2xl text-foreground">{filtered.length} configs available</p>
        </div>
        {/* Submitting only makes sense in the community tab; verified is source-only. */}
        {tab === "community" && <SubmitDialog onAdd={handleAdd} />}
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-col gap-1 border-b border-border sm:flex-row sm:gap-2">
        <TabButton active={tab === "verified"} onClick={() => setTab("verified")}>
          <ShieldCheck className="size-4" />
          some configs that we consider good
        </TabButton>
        <TabButton active={tab === "community"} onClick={() => setTab("community")}>
          <Users className="size-4" />
          community configs
        </TabButton>
      </div>

      {/* Context line for the active tab */}
      <p className="mb-6 font-mono text-xs text-muted-foreground">
        {tab === "verified"
          ? "// verified, read-only. these are maintained directly in the source."
          : "// user-submitted. anyone can add a config to this list."}
      </p>

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
          {query ? `no configs match "${query}"` : "no configs here yet"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((config, i) => (
            <ConfigCard key={config.id} config={config} index={i} verified={tab === "verified"} />
          ))}
        </div>
      )}
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`-mb-px flex items-center gap-2 border-b-2 px-1 py-3 text-left font-mono text-sm transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
