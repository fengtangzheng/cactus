import type { MapMarker, NovelProject, SettingCategory, SettingEntry, SettingMap } from './types'

export const settingCategories: SettingCategory[] = ['世界', '地点', '组织', '规则', '物件', '地图']

export const emptyMap = (): SettingMap => ({ width: 1200, height: 800, markers: [] })

export function createSetting(category: SettingCategory = '世界', title?: string): SettingEntry {
  return {
    id: `setting-${crypto.randomUUID()}`, category, title: title ?? (category === '地图' ? '未命名地图' : '未命名设定'),
    summary: '', details: '', tags: [], visibility: 'private', stage: 'inspiration', updatedAt: '刚刚',
    ...(category === '地图' ? { map: emptyMap() } : {}),
  }
}

export function markerLabel(marker: MapMarker, settings: SettingEntry[]) {
  return settings.find((setting) => setting.id === marker.locationId)?.title ?? marker.label
}

export function mapMarkersForNovel(map: SettingEntry, project: NovelProject, novelId?: string): MapMarker[] {
  const markers = map.map?.markers ?? []
  const locations = new Set(project.settings.filter((setting) => setting.category === '地点').map((setting) => setting.id))
  const organizations = new Set(project.settings.filter((setting) => setting.category === '组织').map((setting) => setting.id))
  const novel = novelId ? project.novels?.find((item) => item.id === novelId) : undefined
  if (novelId && (!novel || !novel.settingIds.includes(map.id))) return []
  return markers.filter((marker) => {
    if (marker.locationId && !locations.has(marker.locationId)) return false
    return !novel || (marker.novelIds.includes(novel.id) && (!marker.locationId || novel.settingIds.includes(marker.locationId)))
  }).map((marker) => ({
    ...marker,
    organizations: marker.organizations.filter((link) => organizations.has(link.organizationId) && (!novel || novel.settingIds.includes(link.organizationId))),
  }))
}

export function cleanSettingMap(map: SettingMap, project: NovelProject, mapNovelIds: string[]): SettingMap {
  const locations = new Set(project.settings.filter((setting) => setting.category === '地点').map((setting) => setting.id))
  const organizations = new Set(project.settings.filter((setting) => setting.category === '组织').map((setting) => setting.id))
  return {
    ...map,
    markers: map.markers.filter((marker) => !marker.locationId || locations.has(marker.locationId)).map((marker) => ({
      ...marker,
      x: Math.max(0, Math.min(1, marker.x)), y: Math.max(0, Math.min(1, marker.y)),
      novelIds: marker.novelIds.filter((id) => mapNovelIds.includes(id)),
      organizations: marker.organizations.filter((link) => organizations.has(link.organizationId)),
    })),
  }
}

export function removeSettingFromProject(project: NovelProject, id: string): NovelProject {
  return {
    ...project,
    settings: project.settings.filter((setting) => setting.id !== id).map((setting) => setting.map ? {
      ...setting, map: {
        ...setting.map,
        markers: setting.map.markers.filter((marker) => marker.locationId !== id).map((marker) => ({
          ...marker, organizations: marker.organizations.filter((link) => link.organizationId !== id),
        })),
      },
    } : setting),
    novels: project.novels?.map((novel) => ({ ...novel, settingIds: novel.settingIds.filter((settingId) => settingId !== id) })),
    media: project.media?.filter((asset) => asset.settingId !== id),
  }
}
