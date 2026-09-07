import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Map, Plus, Search } from 'lucide-react'
import { VisibilityBadge } from '../components/VisibilityBadge'
import { ResourceMetaBadges } from '../components/ResourceMetaBadges'
import { SettingEditor, type SettingEditorDraft } from '../components/SettingEditor'
import { clearEditorDraft, listEditorDrafts, saveEditorDraft } from '../editorDrafts'
import { getLinkedNovelIds, getResourceScope, setResourceNovelIds, stageLabels } from '../resourceLinks'
import { cleanSettingMap, createSetting, removeSettingFromProject, settingCategories } from '../settingMaps'
import type { NovelProject, ResourceStage, SettingCategory, SettingEntry } from '../types'

interface SettingsViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
  initialNovelId?: string
  onBack?: () => void
}

export function SettingsView({ project, onChange, initialNovelId, onBack }: SettingsViewProps) {
  const [category, setCategory] = useState<'全部' | SettingCategory>('全部')
  const [query, setQuery] = useState('')
  const [editors, setEditors] = useState<Array<{ setting: SettingEntry; markerId?: string; novelId?: string }>>([])
  const [scopeFilter, setScopeFilter] = useState(initialNovelId ? `novel:${initialNovelId}` : 'all')
  const [stageFilter, setStageFilter] = useState<'all' | ResourceStage>('all')
  const novels = project.novels ?? []
  const drafts = listEditorDrafts<SettingEditorDraft>('setting').filter((draft) => draft.value?.setting)
  const unsavedDrafts = drafts.filter((draft) => !project.settings.some((item) => item.id === draft.id))
  const novelScope = scopeFilter.startsWith('novel:') ? scopeFilter.slice(6) : undefined

  const visibleSettings = useMemo(() => project.settings.filter((item) => {
    const linkedNovelIds = getLinkedNovelIds(novels, 'setting', item.id)
    const scope = getResourceScope(linkedNovelIds)
    return (category === '全部' || item.category === category)
      && `${item.title}${item.summary}${item.tags.join('')}`.toLowerCase().includes(query.toLowerCase())
      && (scopeFilter === 'all' || scopeFilter === scope || (scopeFilter.startsWith('novel:') && linkedNovelIds.includes(scopeFilter.slice(6))))
      && (stageFilter === 'all' || item.stage === stageFilter)
  }), [category, novels, project.settings, query, scopeFilter, stageFilter])

  function openEditor(setting: SettingEntry, markerId?: string, scopedNovelId = novelScope) {
    setEditors((current) => {
      const index = current.findIndex((item) => item.setting.id === setting.id)
      if (index >= 0) return current.slice(0, index + 1).map((item, i) => i === index ? { ...item, markerId } : item)
      return [...current, { setting, markerId, novelId: scopedNovelId }]
    })
  }

  function addSetting(kind: SettingCategory) {
    const setting = createSetting(kind)
    if (novelScope) saveEditorDraft<SettingEditorDraft>('setting', setting.id, { setting, novelIds: [novelScope] })
    openEditor(setting)
  }

  function saveSetting(draft: SettingEditorDraft) {
    const setting = { ...draft.setting, updatedAt: '刚刚' }
    if (setting.map) setting.map = cleanSettingMap(setting.map, project, draft.novelIds)
    const committedAssets = (draft.assets ?? []).filter((asset) => asset.id === setting.map?.backgroundAssetId)
    const assetIds = new Set(committedAssets.map((asset) => asset.id))
    const nextProject = {
      ...project,
      settings: project.settings.some((item) => item.id === setting.id) ? project.settings.map((item) => item.id === setting.id ? setting : item) : [setting, ...project.settings],
      media: [...(project.media ?? []).filter((asset) => !assetIds.has(asset.id)), ...committedAssets],
    }
    onChange(setResourceNovelIds(nextProject, 'setting', setting.id, draft.novelIds))
    clearEditorDraft('setting', setting.id)
    setEditors((current) => current.slice(0, -1))
  }

  function removeSetting(id: string) {
    const setting = project.settings.find((item) => item.id === id)
    if (!setting) return
    const linkedCount = getLinkedNovelIds(novels, 'setting', id).length
    const markerCount = project.settings.reduce((count, item) => count + (item.map?.markers.filter((marker) => marker.locationId === id || marker.organizations.some((link) => link.organizationId === id)).length ?? 0), 0)
    if (!window.confirm(`删除“${setting.title}”？将解除 ${linkedCount} 部小说引用及 ${markerCount} 处地图关联。删除地图不会删除地点和组织资料。`)) return
    onChange(removeSettingFromProject(project, id))
    clearEditorDraft('setting', id)
    setEditors((current) => current.filter((item) => item.setting.id !== id))
  }

  return <div className="view-stack">
    {onBack && initialNovelId && <nav className="context-nav"><button onClick={onBack}><ArrowLeft size={15} /> 返回小说概览</button><span>{novels.find((novel) => novel.id === initialNovelId)?.title} / 设定集</span></nav>}
    <section className="toolbar-row setting-toolbar">
      <div className="segmented-control">{(['全部', ...settingCategories] as const).map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="toolbar-actions"><label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索设定" /></label><button className="ghost-button" onClick={() => addSetting('地图')}><Map size={16} /> 新建地图</button><button className="primary-button" onClick={() => addSetting(category === '全部' ? '世界' : category)}><Plus size={16} /> 新建设定</button></div>
    </section>
    <section className="resource-filter-bar">
      <label>归属<select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)}><option value="all">全部范围</option><option value="independent">独立资料</option><option value="exclusive">小说专属</option><option value="shared">多作品共享</option>{novels.map((novel) => <option key={novel.id} value={`novel:${novel.id}`}>《{novel.title}》</option>)}</select></label>
      <label>阶段<select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as typeof stageFilter)}><option value="all">全部阶段</option>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </section>
    {unsavedDrafts.length > 0 && <section className="setting-draft-list"><span>未保存的新资料</span>{unsavedDrafts.map((draft) => <button className="ghost-button" key={draft.id} onClick={() => openEditor(draft.value.setting)}>继续草稿：{draft.value.setting.title}</button>)}</section>}
    <section className="setting-grid">
      {visibleSettings.map((item) => <button className="setting-card" key={item.id} onClick={() => openEditor(item)}>
        <div className="setting-card-top"><span className={`category-icon category-${item.category}`}>{item.category === '地图' ? <Map size={18} /> : item.category.slice(0, 1)}</span><VisibilityBadge value={item.visibility} /></div>
        <span className="eyebrow">{item.category}{drafts.some((draft) => draft.id === item.id) ? ' · 有本机草稿' : ''}</span>
        <ResourceMetaBadges stage={item.stage} novelIds={getLinkedNovelIds(novels, 'setting', item.id)} novels={novels} />
        <h3>{item.title}</h3><p>{item.summary || (item.category === '地图' ? '打开地图查看地点与组织驻地。' : '还没有补充一句话说明。')}</p>
        <div className="tag-row">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><footer><small>更新于 {item.updatedAt}</small><ChevronRight size={15} /></footer>
      </button>)}
      <button className="setting-card add-card" onClick={() => addSetting(category === '全部' ? '世界' : category)}><span><Plus size={20} /></span><strong>添加新的设定</strong><small>地图、地点、规则、组织或关键物件</small></button>
    </section>
    {editors.map((entry, index) => <div key={entry.setting.id} hidden={index !== editors.length - 1}>
      <SettingEditor setting={entry.setting} project={project} initialNovelId={entry.novelId} initialMarkerId={entry.markerId} nested={index > 0} onSave={saveSetting} onClose={() => setEditors((current) => current.slice(0, -1))} onRemove={() => removeSetting(entry.setting.id)} onOpen={openEditor}
        onCreateLocation={(title, linkedNovelIds) => { const location = createSetting('地点', title); onChange(setResourceNovelIds({ ...project, settings: [location, ...project.settings] }, 'setting', location.id, linkedNovelIds)); return location.id }}
        onCopy={(draft) => {
          const copy = { ...draft.setting, id: `setting-${crypto.randomUUID()}`, title: `${draft.setting.title} · 副本`, visibility: 'private' as const }
          const copiedAssets = [...(project.media ?? []), ...(draft.assets ?? [])].filter((asset) => asset.id === copy.map?.backgroundAssetId).map((asset) => ({ ...asset, id: `map-image-${crypto.randomUUID()}`, settingId: copy.id }))
          if (copy.map) copy.map = { ...copy.map, backgroundAssetId: copiedAssets[0]?.id, markers: copy.map.markers.map((marker) => ({ ...marker, id: `pin-${crypto.randomUUID()}`, novelIds: [] })) }
          saveEditorDraft<SettingEditorDraft>('setting', copy.id, { setting: copy, novelIds: [], assets: copiedAssets, tagsText: draft.tagsText })
          openEditor(copy)
        }} />
    </div>)}
  </div>
}
