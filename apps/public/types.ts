export interface PublicSetting {
  id: string
  category: string
  title: string
  summary: string
}

export interface PublicCharacter {
  id: string
  name: string
  role: string
  motivation: string
  color: string
}

export interface PublicChapter {
  id: string
  title: string
  excerpt: string
  published: boolean
}

export interface PublicSnapshot {
  siteTitle: string
  profile: {
    name: string
    handle: string
    tagline: string
    introduction: string
  }
  notes: Array<{
    id: string
    title: string
    excerpt: string
    category: string
    date: string
  }>
  learning: Array<{
    id: string
    title: string
    excerpt: string
    category: string
    date: string
  }>
  projects: Array<{
    id: string
    title: string
    summary: string
    kind: string
    status: string
    accent: string
  }>
  work: {
    title: string
    subtitle: string
    synopsis: string
    status: string
    wordCount: number
    settings: PublicSetting[]
    characters: PublicCharacter[]
    chapters: PublicChapter[]
  }
}
