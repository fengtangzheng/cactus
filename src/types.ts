export type Visibility = 'private' | 'public'

export type SettingCategory = '世界' | '地点' | '组织' | '规则' | '物件'

export interface SettingEntry {
  id: string
  category: SettingCategory
  title: string
  summary: string
  details: string
  tags: string[]
  visibility: Visibility
  updatedAt: string
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
  updatedAt: string
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
}

export interface NovelProject {
  title: string
  subtitle: string
  penName: string
  synopsis: string
  settings: SettingEntry[]
  characters: Character[]
  relationships: Relationship[]
  chapters: Chapter[]
}
