export type CfgConfig = {
  id: string
  name: string
  author: string
  dateAdded: string // ISO date
  description: string
  content: string // legacy / fallback raw body
  collection: string
  downloadUrl?: string
  thumbnailUrl?: string | null
  weaponPercentages?: string | null
  mapPlaylistCodes?: string | null
  genreTags?: string[]
}

/** Community-submitted configs share the same shape as curated configs. */
export type CommunityConfig = CfgConfig
