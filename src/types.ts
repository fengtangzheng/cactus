export type Visibility = 'private' | 'public'

export type ResourceStage = 'inspiration' | 'developing' | 'canonical' | 'archived'

export type EssayStatus = 'draft' | 'published' | 'archived'

export interface Essay {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: EssayStatus
  createdAt: string
  updatedAt: string
}

export type SettingCategory = '世界' | '地点' | '组织' | '规则' | '物件' | '地图'

export interface MapOrganization {
  organizationId: string
  kind: '总部' | '分部' | '据点'
}

export interface MapMarker {
  id: string
  x: number
  y: number
  label: string
  note: string
  locationId?: string
  novelIds: string[]
  organizations: MapOrganization[]
}

export interface SettingMap {
  width: number
  height: number
  backgroundAssetId?: string
  markers: MapMarker[]
}

export interface SettingEntry {
  id: string
  category: SettingCategory
  title: string
  summary: string
  details: string
  tags: string[]
  visibility: Visibility
  stage: ResourceStage
  updatedAt: string
  map?: SettingMap
}

export type MediaRole = 'portrait' | 'cover' | 'graph-avatar' | 'gallery' | 'map-base'

export interface MediaAsset {
  id: string
  characterId?: string
  settingId?: string
  type: 'image' | 'video'
  title: string
  caption: string
  tags: string[]
  visibility: Visibility
  role: MediaRole
  sortOrder: number
  source: string
  publicUrl?: string
  blobId?: string
  storagePath?: string
  fileName?: string
  mimeType?: string
  size?: number
  createdAt: string
}

export interface Character {
  id: string
  name: string
  alias: string
  role: string
  faction: string
  age: string
  appearance: string
  personality: string
  motivation: string
  secret: string
  color: string
  visibility: Visibility
  stage: ResourceStage
  updatedAt: string
  mediaIds?: string[]
}

export interface Relationship {
  id: string
  sourceId: string
  targetId: string
  label: string
  detail: string
  tone: 'positive' | 'negative' | 'neutral' | 'hidden'
  visibility: Visibility
}

export interface Chapter {
  id: string
  title: string
  status: 'draft' | 'revising' | 'ready'
  wordCount: number
  updatedAt: string
  novelId?: string
  content?: string
}

export interface Novel {
  id: string
  title: string
  subtitle: string
  synopsis: string
  status: 'idea' | 'drafting' | 'serializing' | 'completed'
  visibility: Visibility
  settingIds: string[]
  characterIds: string[]
  relationshipIds: string[]
  chapterIds: string[]
  updatedAt: string
}

export interface NovelProject {
  dataVersion?: number
  title: string
  subtitle: string
  penName: string
  synopsis: string
  settings: SettingEntry[]
  characters: Character[]
  relationships: Relationship[]
  chapters: Chapter[]
  essays?: Essay[]
  novels?: Novel[]
  media?: MediaAsset[]
}
