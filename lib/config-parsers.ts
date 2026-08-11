export type WeaponSpawn = {
  name: string
  count?: number
  percentage: number
}

const WEAPON_LINE_RE = /^(.+?)\s*-\s*(\d+)\s*\(([\d.]+)%\)\s*$/

export function parseWeaponPercentages(text: string): WeaponSpawn[] {
  if (!text.trim()) return []

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(WEAPON_LINE_RE)
      if (!match) {
        const pctMatch = line.match(/\(([\d.]+)%\)/)
        return {
          name: line.replace(/\s*-\s*\d+\s*\([\d.]+%\)\s*$/, "").trim() || line,
          percentage: pctMatch ? Number.parseFloat(pctMatch[1]) : 0,
        }
      }
      return {
        name: match[1].trim(),
        count: Number.parseInt(match[2], 10),
        percentage: Number.parseFloat(match[3]),
      }
    })
}

export function parseMapPlaylistCodes(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function parseGenreTags(value: string[] | string | null | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)

  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean)
      }
    } catch {
      // fall through to comma split
    }
  }

  return trimmed
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

type LegacySections = {
  weaponPercentages: string
  mapPlaylistCodes: string
  genreTags: string[]
}

export function extractLegacySections(content: string): LegacySections {
  const weaponMatch = content.match(/\[WEAPON SPAWN PERCENTAGES\]\s*([\s\S]*?)(?=\n\[|$)/i)
  const mapMatch = content.match(/\[MAP PLAYLIST CODES\]\s*([\s\S]*?)(?=\n\[|$)/i)
  const tagMatch = content.match(/\[GENRE TAGS\]\s*([\s\S]*?)(?=\n\[|$)/i)

  return {
    weaponPercentages: weaponMatch?.[1]?.trim() ?? "",
    mapPlaylistCodes: mapMatch?.[1]?.trim() ?? "",
    genreTags: parseGenreTags(tagMatch?.[1]?.trim() ?? ""),
  }
}

export function resolveConfigFields(config: {
  content: string
  weaponPercentages?: string | null
  mapPlaylistCodes?: string | null
  genreTags?: string[] | string | null
}) {
  const legacy = extractLegacySections(config.content)

  const weaponText = config.weaponPercentages?.trim() || legacy.weaponPercentages
  const mapText = config.mapPlaylistCodes?.trim() || legacy.mapPlaylistCodes
  const tags =
    parseGenreTags(config.genreTags).length > 0
      ? parseGenreTags(config.genreTags)
      : legacy.genreTags

  return {
    weapons: parseWeaponPercentages(weaponText),
    maps: parseMapPlaylistCodes(mapText),
    genreTags: tags,
    weaponPercentagesRaw: weaponText,
    mapPlaylistCodesRaw: mapText,
  }
}
