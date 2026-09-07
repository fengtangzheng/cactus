import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

const bundled = await build({
  stdin: { contents: `export * from './src/settingMaps'; export * from './src/editorDrafts'; export { createPublicSnapshot } from './src/publicSnapshot'; export { mergeUploadedMedia } from './src/cloud/mediaRepository';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'esm', define: { 'import.meta.env': '{}' },
})
const { createSetting, emptyMap, markerLabel, mapMarkersForNovel, cleanSettingMap, removeSettingFromProject, createPublicSnapshot, mergeUploadedMedia, saveEditorDraft, loadEditorDraft, listEditorDrafts, clearEditorDraft } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`)

const setting = (id, category) => ({ ...createSetting(category, id), id, visibility: 'public' })
const pin = (id, locationId, novelIds = ['a', 'b'], organizations = []) => ({ id, locationId, novelIds, organizations, x: 0.2, y: 0.8, label: id, note: '' })
function fixture() {
  const map = { ...setting('shared-map', '地图'), map: { ...emptyMap(), backgroundAssetId: 'base', markers: [
    pin('shared', 'city', ['a', 'b'], [{ organizationId: 'org-a', kind: '总部' }, { organizationId: 'org-b', kind: '分部' }]),
    pin('only-a', 'city-a', ['a', 'b']),
    pin('idea-a', undefined, ['a']),
    pin('unassigned', undefined, []),
  ] } }
  const novels = ['a', 'b'].map((id) => ({ id, title: id, subtitle: '', synopsis: '', status: 'drafting', visibility: 'public', settingIds: ['shared-map', 'city', `city-${id}`, `org-${id}`], characterIds: [], relationshipIds: [], chapterIds: [], updatedAt: '' }))
  return { title: '', subtitle: '', penName: '', synopsis: '', settings: [map, setting('city', '地点'), setting('city-a', '地点'), setting('city-b', '地点'), setting('org-a', '组织'), setting('org-b', '组织')], novels, characters: [], relationships: [], chapters: [], media: [{ id: 'base', settingId: map.id, blobId: 'local-base', role: 'map-base', type: 'image', visibility: 'public', publicUrl: '/private-base.png' }] }
}

test('共享地图按小说同时过滤标记、地点和组织，不自动扩大引用', () => {
  const project = fixture()
  const a = mapMarkersForNovel(project.settings[0], project, 'a')
  const b = mapMarkersForNovel(project.settings[0], project, 'b')
  assert.deepEqual(a.map((item) => item.id), ['shared', 'only-a', 'idea-a'])
  assert.deepEqual(b.map((item) => item.id), ['shared'])
  assert.deepEqual(a[0].organizations.map((item) => item.organizationId), ['org-a'])
  assert.deepEqual(b[0].organizations.map((item) => item.organizationId), ['org-b'])
  project.novels[1].settingIds = project.novels[1].settingIds.filter((id) => id !== 'shared-map')
  assert.deepEqual(mapMarkersForNovel(project.settings[0], project, 'b'), [])
  assert.deepEqual(mapMarkersForNovel(project.settings[0], project, 'missing'), [])
  assert.equal(mapMarkersForNovel(project.settings[0], project).length, 4)
})

test('地点重命名立即反映到地图；删除地点清理所有地图引用', () => {
  const project = fixture()
  project.settings[1].title = '新城名'
  assert.equal(markerLabel(project.settings[0].map.markers[0], project.settings), '新城名')
  const removed = removeSettingFromProject(project, 'city')
  assert.equal(removed.settings[0].map.markers.some((item) => item.locationId === 'city'), false)
  assert.equal(removed.novels.some((novel) => novel.settingIds.includes('city')), false)
  assert.equal(project.settings[0].map.markers.length, 4)
})

test('删除组织仅清理驻地；删除地图保留资料并移除附件元数据', () => {
  const project = fixture()
  const withoutOrg = removeSettingFromProject(project, 'org-a')
  assert.equal(withoutOrg.settings[0].map.markers.length, 4)
  assert.deepEqual(withoutOrg.settings[0].map.markers[0].organizations.map((item) => item.organizationId), ['org-b'])
  const withoutMap = removeSettingFromProject(project, 'shared-map')
  assert.equal(withoutMap.settings.length, 5)
  assert.equal(withoutMap.media.length, 0)
})

test('旧草稿保存时清理已删除引用，限制坐标与小说归属', () => {
  const project = fixture()
  const staleMap = structuredClone(project.settings[0].map)
  staleMap.markers[0].x = -2
  staleMap.markers[0].y = 3
  const current = removeSettingFromProject(removeSettingFromProject(project, 'org-a'), 'city-a')
  const cleaned = cleanSettingMap(staleMap, current, ['b'])
  assert.equal(cleaned.markers.length, 3)
  assert.equal(cleaned.markers[0].x, 0)
  assert.equal(cleaned.markers[0].y, 1)
  assert.deepEqual(cleaned.markers[0].novelIds, ['b'])
  assert.deepEqual(cleaned.markers[0].organizations.map((item) => item.organizationId), ['org-b'])
})

test('公开快照强制排除地图及底图，即使误标为公开', () => {
  const project = fixture()
  const snapshot = createPublicSnapshot(project)
  assert.ok(snapshot.novels.every((novel) => novel.settings.every((item) => item.category !== '地图')))
  const serialized = JSON.stringify(snapshot)
  for (const secret of ['private-base.png', 'backgroundAssetId', 'local-base', 'idea-a', 'shared-map']) assert.equal(serialized.includes(secret), false)
})

test('上传完成只补充附件地址，保留期间新增正文、标记和附件删除', () => {
  const project = fixture()
  const uploaded = structuredClone(project)
  uploaded.media[0].storagePath = 'owner/main/base.png'
  uploaded.media[0].source = '云端同步'
  const current = structuredClone(project)
  current.settings[0].details = '上传期间新写的正文'
  current.settings[0].map.markers.push(pin('new-pin', undefined))
  current.media[0].title = '新的底图标题'
  const merged = mergeUploadedMedia(current, uploaded)
  assert.equal(merged.settings[0].details, '上传期间新写的正文')
  assert.equal(merged.settings[0].map.markers.length, 5)
  assert.equal(merged.media[0].title, '新的底图标题')
  assert.equal(merged.media[0].storagePath, 'owner/main/base.png')
  assert.deepEqual(mergeUploadedMedia({ ...current, media: [] }, uploaded).media, [])
})

test('新地图和附件元数据草稿可恢复；单个损坏草稿不妨碍恢复', () => {
  const entries = new Map()
  globalThis.window = { localStorage: { get length() { return entries.size }, key: (index) => [...entries.keys()][index], getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: (key) => entries.delete(key) } }
  const project = fixture()
  const draft = { setting: project.settings[0], novelIds: ['a'], assets: project.media, tagsText: '山川,边城，' }
  saveEditorDraft('setting', draft.setting.id, draft)
  entries.set('cactus-editor-draft-v1:setting:bad', '{')
  assert.deepEqual(loadEditorDraft('setting', draft.setting.id), JSON.parse(JSON.stringify(draft)))
  assert.equal(listEditorDrafts('setting').length, 1)
  clearEditorDraft('setting', draft.setting.id)
  assert.equal(loadEditorDraft('setting', draft.setting.id), null)
  delete globalThis.window
})
