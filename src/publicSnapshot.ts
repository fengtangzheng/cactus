import type { NovelProject } from './types'
import { profile } from './personalData'

export function createPublicSnapshot(project: NovelProject) {
  const publicCharacterIds = new Set(project.characters.filter((character) => character.visibility === 'public').map((character) => character.id))
  const publicMedia = (project.media ?? []).filter((asset) => !asset.settingId && asset.role !== 'map-base' && asset.visibility === 'public' && asset.publicUrl)
  const mediaByCharacter = (characterId: string) => publicMedia
    .filter((asset) => asset.characterId === characterId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, type, title, caption, tags, role, publicUrl }) => ({ id, type, title, caption, tags, role, url: publicUrl! }))

  const novels = (project.novels ?? []).filter((novel) => novel.visibility === 'public').map((novel) => ({
    id: novel.id,
    slug: novel.id,
    title: novel.title,
    subtitle: novel.subtitle,
    synopsis: novel.synopsis,
    status: novel.status,
    wordCount: project.chapters.filter((chapter) => novel.chapterIds.includes(chapter.id)).reduce((sum, chapter) => sum + chapter.wordCount, 0),
    settings: project.settings.filter((setting) => setting.category !== '地图' && novel.settingIds.includes(setting.id) && setting.visibility === 'public').map(({ id, category, title, summary }) => ({ id, category, title, summary })),
    characters: project.characters.filter((character) => novel.characterIds.includes(character.id) && publicCharacterIds.has(character.id)).map(({ id, name, role, motivation, color }) => ({ id, name, role, motivation, color, media: mediaByCharacter(id) })),
    relationships: project.relationships.filter((relationship) => novel.relationshipIds.includes(relationship.id) && relationship.visibility === 'public' && publicCharacterIds.has(relationship.sourceId) && publicCharacterIds.has(relationship.targetId)).map(({ id, sourceId, targetId, label, tone }) => ({ id, sourceId, targetId, label, tone })),
    chapters: project.chapters.filter((chapter) => novel.chapterIds.includes(chapter.id) && chapter.status === 'ready').map(({ id, title, content }) => ({ id, slug: id, title, excerpt: content?.slice(0, 90) ?? '', content: content ?? '' })),
  }))

  return {
    siteTitle: 'Cactus',
    profile,
    gallery: mediaByCharacter('kiro'),
    essays: (project.essays ?? []).filter((essay) => essay.status === 'published').map(({ id, slug, title, excerpt, content, category, tags, createdAt }) => ({ id, slug, title, excerpt, content, category, tags, date: createdAt })),
    novels,
    stats: {
      essays: (project.essays ?? []).filter((essay) => essay.status === 'published').length,
      novels: novels.length,
      chapters: novels.reduce((sum, novel) => sum + novel.chapters.length, 0),
    },
  }
}

export function downloadPublicSnapshot(project: NovelProject) {
  const snapshot = createPublicSnapshot(project)
  const blob = new Blob([`${JSON.stringify(snapshot, null, 2)}\n`], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'public.json'
  anchor.click()
  URL.revokeObjectURL(url)
}
