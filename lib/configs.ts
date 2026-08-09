export type CfgConfig = {
  id: string
  name: string
  author: string
  dateAdded: string // ISO date
  description: string
  content: string // the raw preset body used for copy-to-clipboard
  collection: string // folder / collection this config belongs to
  downloadUrl?: string
}

// Hardcoded, read-only verified configs shown in the "good" tab.
// Add new entries here directly — this list ships with the code, not the database.
export const seedConfigs: CfgConfig[] = []
