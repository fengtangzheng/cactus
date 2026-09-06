export interface PublicMedia { id: string; type: 'image' | 'video'; title: string; caption: string; tags: string[]; role: string; url: string }
export interface PublicSetting { id: string; category: string; title: string; summary: string }
export interface PublicCharacter { id: string; name: string; role: string; motivation: string; color: string; media: PublicMedia[] }
export interface PublicChapter { id: string; slug: string; title: string; excerpt: string; content: string }
export interface PublicNovel {
  id: string; slug: string; title: string; subtitle: string; synopsis: string; status: string; wordCount: number
  settings: PublicSetting[]; characters: PublicCharacter[]
  relationships: Array<{ id: string; sourceId: string; targetId: string; label: string; tone: string }>
  chapters: PublicChapter[]
}
export interface PublicEssay { id: string; slug: string; title: string; excerpt: string; content: string; category: string; tags: string[]; date: string }
export interface PublicSnapshot {
  siteTitle: string
  profile: { brand: string; name: string; englishName: string; alias: string; handle: string; tagline: string; introduction: string }
  gallery: PublicMedia[]
  essays: PublicEssay[]
  novels: PublicNovel[]
  stats: { essays: number; novels: number; chapters: number }
}
