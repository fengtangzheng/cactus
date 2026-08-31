import type { NovelProject } from './types'

export function createPublicSnapshot(project: NovelProject) {
  const publicCharacterIds = new Set(
    project.characters
      .filter((character) => character.visibility === 'public')
      .map((character) => character.id),
  )

  return {
    siteTitle: project.penName,
    work: {
      title: project.title,
      subtitle: project.subtitle,
      synopsis: project.synopsis,
      status: '连载中',
      wordCount: project.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
      settings: project.settings
        .filter((setting) => setting.visibility === 'public')
        .map(({ id, category, title, summary }) => ({ id, category, title, summary })),
      characters: project.characters
        .filter((character) => publicCharacterIds.has(character.id))
        .map(({ id, name, role, motivation, color }) => ({ id, name, role, motivation, color })),
      relationships: project.relationships
        .filter((relationship) => (
          relationship.visibility === 'public'
          && publicCharacterIds.has(relationship.sourceId)
          && publicCharacterIds.has(relationship.targetId)
        ))
        .map(({ id, sourceId, targetId, label, tone }) => ({ id, sourceId, targetId, label, tone })),
      chapters: project.chapters
        .filter((chapter) => chapter.status === 'ready')
        .map(({ id, title }) => ({ id, title, excerpt: '', published: true })),
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
