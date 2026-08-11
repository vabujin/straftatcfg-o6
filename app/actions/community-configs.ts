"use server"

import { createClient } from "@/lib/supabase/server"
import type { CfgConfig, CommunityConfig } from "@/lib/configs"
import { parseGenreTags } from "@/lib/config-parsers"

export type { CommunityConfig }

export type SubmitConfigInput = {
  collection: string
  name: string
  author: string
  description: string
  weaponPercentages: string
  mapPlaylistCodes: string
  genreTags: string[]
  thumbnailDataUrl?: string | null
}

export type SubmitConfigResult = { success: true; config: CommunityConfig } | { success: false; error: string }

type DbRow = {
  id: string
  name: string
  author: string
  description: string
  content: string
  collection: string
  created_at: string
  thumbnail_url?: string | null
  weapon_percentages?: string | null
  map_playlist_codes?: string | null
  genre_tags?: string[] | string | null
}

const SELECT_FIELDS =
  "id, name, author, description, content, collection, created_at, thumbnail_url, weapon_percentages, map_playlist_codes, genre_tags"

function toCfgConfig(row: DbRow): CommunityConfig {
  return {
    id: row.id,
    name: row.name,
    author: row.author,
    description: row.description,
    content: row.content,
    collection: row.collection,
    dateAdded: row.created_at,
    thumbnailUrl: row.thumbnail_url ?? null,
    weaponPercentages: row.weapon_percentages ?? null,
    mapPlaylistCodes: row.map_playlist_codes ?? null,
    genreTags: parseGenreTags(row.genre_tags),
  }
}

function buildLegacyContent(input: SubmitConfigInput): string {
  const sections: string[] = []

  const spawns = input.weaponPercentages.trim()
  if (spawns) sections.push(`[WEAPON SPAWN PERCENTAGES]\n${spawns}`)

  const playlist = input.mapPlaylistCodes.trim()
  if (playlist) sections.push(`[MAP PLAYLIST CODES]\n${playlist}`)

  if (input.genreTags.length > 0) sections.push(`[GENRE TAGS]\n${input.genreTags.join(", ")}`)

  return sections.join("\n\n") || `// ${input.name}`
}

async function uploadThumbnail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dataUrl: string,
  configId: string,
): Promise<string | null> {
  const match = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
  if (!match) return dataUrl.startsWith("http") ? dataUrl : null

  const mimeType = match[1]
  const base64 = match[2]
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "png"
  const path = `thumbnails/${configId}.${ext}`

  const buffer = Buffer.from(base64, "base64")

  const { error } = await supabase.storage.from("config-thumbnails").upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  })

  if (error) {
    console.warn("[v0] Thumbnail storage upload failed, using data URL:", error.message)
    return dataUrl.length <= 500_000 ? dataUrl : null
  }

  const { data } = supabase.storage.from("config-thumbnails").getPublicUrl(path)
  return data.publicUrl
}

export async function getCommunityConfigs(): Promise<CommunityConfig[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("community_configs").select(SELECT_FIELDS).order("created_at", {
    ascending: false,
  })

  if (error) {
    console.warn("[v0] Community configs unavailable, showing empty hub:", error.message)
    return []
  }

  return (data ?? []).map((row) => toCfgConfig(row as DbRow))
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
    content: buildLegacyContent(input).slice(0, 4000),
    collection: trimmedCollection.slice(0, 80),
    weapon_percentages: input.weaponPercentages.trim().slice(0, 4000) || null,
    map_playlist_codes: input.mapPlaylistCodes.trim().slice(0, 4000) || null,
    genre_tags: input.genreTags.slice(0, 6),
    thumbnail_url: null as string | null,
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("community_configs").insert(record).select(SELECT_FIELDS).single()

  if (error) {
    console.warn("[v0] Could not submit community config:", error.message)
    return { success: false, error: "Could not save your config. Please try again." }
  }

  let config = toCfgConfig(data as DbRow)

  if (input.thumbnailDataUrl) {
    const thumbnailUrl = await uploadThumbnail(supabase, input.thumbnailDataUrl, config.id)
    if (thumbnailUrl) {
      const { data: updated, error: updateError } = await supabase
        .from("community_configs")
        .update({ thumbnail_url: thumbnailUrl })
        .eq("id", config.id)
        .select(SELECT_FIELDS)
        .single()

      if (!updateError && updated) {
        config = toCfgConfig(updated as DbRow)
      } else {
        config = { ...config, thumbnailUrl }
      }
    }
  }

  return { success: true, config }
}
