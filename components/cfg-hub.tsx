"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Search, ArrowLeft } from "lucide-react"
import { seedConfigs, type CfgConfig } from "@/lib/configs"
import { getCommunityConfigs } from "@/app/actions/community-configs"
import { ConfigCard } from "@/components/config-card"
import { ConfigFolderCard } from "@/components/config-folder-card"
import { SubmitDialog } from "@/components/submit-dialog"

type Tab = "verified" | "community"

const TABS: { id: Tab; label: string }[] = [
  { id: "verified", label: "SOME CONFIGS THAT WE CONSIDER GOOD" },
  { id: "community", label: "COMMUNITY CONFIGS" },
]

// Splits a freeform "author name(s)" field ("vabujin, friend2") into distinct names.
function splitContributors(author: string): string[] {
  return author
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
}

export function CfgHub({ initialCommunityConfigs }: { initialCommunityConfigs: CfgConfig[] }) {
  const [tab, setTab] = useState<Tab>("verified")
  const [query, setQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const { data: communityConfigs = [], mutate } = useSWR<CfgConfig[]>("community-configs", getCommunityConfigs, {
    fallbackData: initialCommunityConfigs,
    revalidateOnFocus: false,
  })

  const folders = useMemo(() => {
    const map = new Map<string, CfgConfig[]>()
    for (const config of communityConfigs) {
      const key = config.collection || "uncategorized"
      const list = map.get(key)
      if (list) {
        list.push(config)
      } else {
        map.set(key, [config])
      }
    }
    return Array.from(map.entries()).map(([name, configs]) => ({
      name,
      configs,
      contributors: Array.from(new Set(configs.flatMap((c) => splitContributors(c.author)))),
    }))
  }, [communityConfigs])

  const activeFolder = tab === "community" ? folders.find((f) => f.name === selectedFolder) : undefined

  const changeTab = (next: Tab) => {
    setTab(next)
    setSelectedFolder(null)
    setQuery("")
  }

  const searching = query.trim().length > 0
  const q = query.trim().toLowerCase()

  const verifiedResults = useMemo(() => {
    if (!q) return seedConfigs
    return seedConfigs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [q])

  const communitySearchResults = useMemo(() => {
    if (!q) return []
    return communityConfigs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.collection.toLowerCase().includes(q),
    )
  }, [communityConfigs, q])

  const folderResults = useMemo(() => {
    if (!q) return folders
    return folders.filter((f) => f.name.toLowerCase().includes(q))
  }, [folders, q])

  const handleAdd = (config: CfgConfig) => {
    mutate((current) => [config, ...(current ?? [])], { revalidate: false })
    setTab("community")
    setSelectedFolder(config.collection)
    setQuery("")
  }

  const resultCount =
    tab === "verified" ? verifiedResults.length : searching ? communitySearchResults.length : folders.length

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-widest text-primary">// the hub</h2>
          <p className="mt-1 text-2xl text-foreground">
            {resultCount} {tab === "community" && !searching ? "folders" : "configs"} available
          </p>
        </div>
        {/* Submitting only makes sense in the community tab; verified is source-only. */}
        {tab === "community" && <SubmitDialog onAdd={handleAdd} />}
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
            onClick={() => changeTab(t.id)}
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
          placeholder={tab === "community" ? "search configs, folders, authors..." : "search configs, authors..."}
          className="cfg-input pl-9"
          aria-label="Search configs"
        />
      </div>

      {tab === "verified" && (
        <>
          {verifiedResults.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-muted-foreground">
              {query ? `no configs match "${query}"` : "no configs found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedResults.map((config, i) => (
                <ConfigCard key={config.id} config={config} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "community" && searching && (
        <>
          {communitySearchResults.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-muted-foreground">
              no configs match &quot;{query}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communitySearchResults.map((config, i) => (
                <ConfigCard key={config.id} config={config} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "community" && !searching && !activeFolder && (
        <>
          {folderResults.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-muted-foreground">
              no community configs yet. be the first to submit one.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {folderResults.map((folder, i) => (
                <ConfigFolderCard
                  key={folder.name}
                  name={folder.name}
                  count={folder.configs.length}
                  contributors={folder.contributors}
                  index={i}
                  onOpen={() => setSelectedFolder(folder.name)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "community" && !searching && activeFolder && (
        <>
          <button
            type="button"
            onClick={() => setSelectedFolder(null)}
            className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> back to folders
          </button>

          <h3 className="mb-4 text-pretty font-mono text-lg text-foreground">{activeFolder.name}</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeFolder.configs.map((config, i) => (
              <ConfigCard key={config.id} config={config} index={i} />
            ))}
          </div>

          <p className="mt-6 text-right font-mono text-xs text-muted-foreground">
            <span className="text-foreground">folder authors / contributors:</span>{" "}
            {activeFolder.contributors.join(", ")}
          </p>
        </>
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
