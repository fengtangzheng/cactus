import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { seedProject } from './data'
import { chineseHistoryCharacters, chineseHistoryNovel, chineseHistoryRelationships } from './data/chineseHistory'
import type { Character, NovelProject, Relationship, ResourceStage, SettingEntry } from './types'

export const PROJECT_STORAGE_KEY = 'cactus-novel-project-v1'

export function normalizeProject(project: NovelProject): NovelProject {
  const sourceVersion = project.dataVersion ?? 1
  const migrateId = (id: string) => id === 'kira' ? 'kiro' : id
  type LegacyLink = { novelIds?: string[] }
  const legacySettings = project.settings as Array<SettingEntry & LegacyLink & { stage?: ResourceStage }>
  const legacyCharacters = project.characters as Array<Character & LegacyLink & { stage?: ResourceStage }>
  const legacyRelationships = project.relationships as Array<Relationship & LegacyLink>
  const stripLegacyLinks = <T extends object>(item: T & LegacyLink) => {
    const copy = { ...item }
    delete copy.novelIds
    return copy
  }

  const settings = legacySettings.map((setting) => ({ ...stripLegacyLinks(setting), stage: setting.stage ?? 'developing' as const }))
  const characters = legacyCharacters.map((character) => ({
    ...stripLegacyLinks(character),
    id: migrateId(character.id),
    stage: character.stage ?? (migrateId(character.id) === 'kiro' ? 'canonical' : 'developing'),
  }))
  const relationships = legacyRelationships.map((relationship) => ({
    ...stripLegacyLinks(relationship),
    sourceId: migrateId(relationship.sourceId),
    targetId: migrateId(relationship.targetId),
  }))
  const seedKiro = seedProject.characters.find((character) => character.id === 'kiro')
  const hasKiro = characters.some((character) => character.id === 'kiro')
  let normalizedCharacters = hasKiro || !seedKiro ? characters : [seedKiro, ...characters]
  let normalizedRelationships = relationships
  if (sourceVersion < 7) {
    const existingCharacterIds = new Set(normalizedCharacters.map((character) => character.id))
    normalizedCharacters = [...normalizedCharacters, ...chineseHistoryCharacters.filter((character) => !existingCharacterIds.has(character.id))]
    const existingRelationshipIds = new Set(normalizedRelationships.map((relationship) => relationship.id))
    normalizedRelationships = [...normalizedRelationships, ...chineseHistoryRelationships.filter((relationship) => !existingRelationshipIds.has(relationship.id))]
  }
  const settingIds = new Set(settings.map((setting) => setting.id))
  const characterIds = new Set(normalizedCharacters.map((character) => character.id))
  const relationshipIds = new Set(normalizedRelationships.map((relationship) => relationship.id))
  let novels = (project.novels ?? seedProject.novels ?? []).map((novel) => ({
    ...novel,
    settingIds: novel.settingIds.filter((id) => settingIds.has(id)),
    characterIds: novel.characterIds.map(migrateId).filter((id) => characterIds.has(id)),
    relationshipIds: novel.relationshipIds.filter((id) => relationshipIds.has(id)),
  }))
  if (sourceVersion < 7 && !novels.some((novel) => novel.id === chineseHistoryNovel.id)) novels = [...novels, chineseHistoryNovel]

  const mergeLegacyLinks = (kind: 'settingIds' | 'characterIds' | 'relationshipIds', resourceId: string, linkedNovelIds?: string[]) => {
    if (!linkedNovelIds?.length) return
    novels = novels.map((novel) => linkedNovelIds.includes(novel.id) && !novel[kind].includes(resourceId)
      ? { ...novel, [kind]: [...novel[kind], resourceId] }
      : novel)
  }
  legacySettings.forEach((setting) => mergeLegacyLinks('settingIds', setting.id, setting.novelIds))
  legacyCharacters.forEach((character) => mergeLegacyLinks('characterIds', migrateId(character.id), character.novelIds))
  legacyRelationships.forEach((relationship) => mergeLegacyLinks('relationshipIds', relationship.id, relationship.novelIds))

  let media = project.media
    ? project.media.map((asset) => ({ ...asset, characterId: asset.characterId ? migrateId(asset.characterId) : undefined }))
    : seedProject.media ?? []
  if (sourceVersion < 3) {
    const refreshedSeedAssets = new Map((seedProject.media ?? []).filter((asset) => ['kk-hero', 'kk-portrait', 'kk-face', 'kk-turnaround'].includes(asset.id)).map((asset) => [asset.id, asset]))
    media = media.map((asset) => refreshedSeedAssets.has(asset.id) ? { ...asset, ...refreshedSeedAssets.get(asset.id)! } : asset)
    const turnaround = (seedProject.media ?? []).find((asset) => asset.id === 'kk-turnaround')
    if (turnaround && !media.some((asset) => asset.id === turnaround.id)) media = [...media, turnaround]
  }
  if (sourceVersion < 6) {
    const existingIds = new Set(media.map((asset) => asset.id))
    const missingLifeAssets = (seedProject.media ?? []).filter((asset) => asset.id.startsWith('kk-life-') && !existingIds.has(asset.id))
    media = [...media, ...missingLifeAssets]
  }

  return {
    ...seedProject,
    ...project,
    settings,
    characters: normalizedCharacters,
    relationships: normalizedRelationships,
    essays: project.essays ?? seedProject.essays,
    novels,
    media,
    dataVersion: seedProject.dataVersion,
  }
}

export function useProject() {
  const hadLocalData = useRef(Boolean(window.localStorage.getItem(PROJECT_STORAGE_KEY)))
  const [project, setStoredProject] = useState<NovelProject>(() => {
    try {
      const saved = window.localStorage.getItem(PROJECT_STORAGE_KEY)
      return saved ? normalizeProject(JSON.parse(saved) as NovelProject) : seedProject
    } catch {
      return seedProject
    }
  })

  useEffect(() => {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const setProject = useCallback<Dispatch<SetStateAction<NovelProject>>>((action) => {
    setStoredProject((current) => normalizeProject(typeof action === 'function' ? action(current) : action))
  }, [])

  const resetProject = useCallback(() => {
    setStoredProject(seedProject)
  }, [])

  return { project, setProject, resetProject, hasLocalData: hadLocalData.current }
}
