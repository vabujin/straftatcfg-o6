"use server"

import { createClient } from "@/lib/supabase/server"
import type { CfgConfig } from "@/lib/configs"

export type SubmitConfigInput = {
  collection: string
  name: string
  author: string
  description: string
  content: string
}

export type SubmitConfigResult = { success: true; config: CfgConfig } | { success: false; error: string }

function toCfgConfig(row: {
  id: string
  name: string
  author: string
  description: string
  content: string
  collection: string
  created_at: string
}): CfgConfig {
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    description: row.description,
    content: row.content,
    collection: row.collection,
    dateAdded: row.created_at,
  }
}

export async function getCommunityConfigs(): Promise<CfgConfig[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("community_configs")
    .select("id, name, author, description, content, collection, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Failed to load community configs:", error.message)
    return []
  }

  return (data ?? []).map(toCfgConfig)
}

export async function submitCommunityConfig(input: SubmitConfigInput): Promise<SubmitConfigResult> {
  const trimmedName = input.name.trim()
  if (!trimmedName) {
    return { success: false, error: "A config title is required." }
  }

  const trimmedCollection = input.collection.trim()
  if (!trimmedCollection) {
    return { success: false, error: "A folder/collection name is required." }
  }

  const finalName = trimmedName.endsWith(".cfg") ? trimmedName : `${trimmedName}.cfg`

  const record = {
    name: finalName.slice(0, 100),
    author: (input.author.trim() || "anonymous").slice(0, 60),
    description: (input.description.trim() || "No description provided.").slice(0, 300),
    content: (input.content.trim() || `// ${finalName}`).slice(0, 4000),
    collection: trimmedCollection.slice(0, 80),
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("community_configs")
    .insert(record)
    .select("id, name, author, description, content, collection, created_at")
    .single()

  if (error) {
    console.error("[v0] Failed to submit community config:", error.message)
    return { success: false, error: "Could not save your config. Please try again." }
  }

  return { success: true, config: toCfgConfig(data) }
}
