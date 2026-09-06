import type { Novel, NovelProject, ResourceStage } from './types'

export type ResourceKind = 'setting' | 'character' | 'relationship'
export type ResourceScope = 'independent' | 'exclusive' | 'shared'

export const stageLabels: Record<ResourceStage, string> = {
  inspiration: '灵感',
  developing: '整理中',
  canonical: '正式资料',
  archived: '已归档',
}

const resourceKeys = {
  setting: 'settingIds',
  character: 'characterIds',
  relationship: 'relationshipIds',
} as const

export function getLinkedNovelIds(novels: Novel[], kind: ResourceKind, resourceId: string) {
  const key = resourceKeys[kind]
  return novels.filter((novel) => novel[key].includes(resourceId)).map((novel) => novel.id)
}

export function getResourceScope(novelIds: string[]): ResourceScope {
  if (novelIds.length === 0) return 'independent'
  if (novelIds.length === 1) return 'exclusive'
  return 'shared'
}

export function setResourceNovelIds(project: NovelProject, kind: ResourceKind, resourceId: string, selectedNovelIds: string[]): NovelProject {
  const selected = new Set(selectedNovelIds)
  const key = resourceKeys[kind]
  const linkedNovels = (project.novels ?? []).map((novel) => ({
    ...novel,
    [key]: selected.has(novel.id)
      ? Array.from(new Set([...novel[key], resourceId]))
      : novel[key].filter((id) => id !== resourceId),
  }))
  const relationshipsById = new Map(project.relationships.map((relationship) => [relationship.id, relationship]))
  return {
    ...project,
    novels: kind === 'character'
      ? linkedNovels.map((novel) => {
          const characterIds = new Set(novel.characterIds)
          return { ...novel, relationshipIds: novel.relationshipIds.filter((id) => {
            const relationship = relationshipsById.get(id)
            return relationship && characterIds.has(relationship.sourceId) && characterIds.has(relationship.targetId)
          }) }
        })
      : linkedNovels,
  }
}
