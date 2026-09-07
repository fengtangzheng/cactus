import { useEffect, useState } from 'react'
import { ArrowLeft, Copy, MapPin, Trash2, X } from 'lucide-react'
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from '../editorDrafts'
import { getLinkedNovelIds, stageLabels } from '../resourceLinks'
import { emptyMap, mapMarkersForNovel, settingCategories } from '../settingMaps'
import type { MediaAsset, NovelProject, ResourceStage, SettingCategory, SettingEntry } from '../types'
import { NovelLinkPicker } from './NovelLinkPicker'
import { SettingMapEditor } from './SettingMapEditor'

export interface SettingEditorDraft {
  setting: SettingEntry
  novelIds: string[]
  assets?: MediaAsset[]
  tagsText?: string
}

interface Props {
  setting: SettingEntry
  project: NovelProject
  initialNovelId?: string
  initialMarkerId?: string
  nested: boolean
  onSave: (draft: SettingEditorDraft) => void
  onClose: () => void
  onRemove: () => void
  onOpen: (setting: SettingEntry, markerId?: string, novelId?: string) => void
  onCreateLocation: (title: string, novelIds: string[]) => string
  onCopy: (draft: SettingEditorDraft) => void
}

export function SettingEditor({ setting, project, initialNovelId, initialMarkerId, nested, onSave, onClose, onRemove, onOpen, onCreateLocation, onCopy }: Props) {
  const [draft] = useState(() => loadEditorDraft<SettingEditorDraft>('setting', setting.id))
  const [editing, setEditing] = useState(draft?.setting ?? setting)
  const [novelIds, setNovelIds] = useState(draft?.novelIds ?? getLinkedNovelIds(project.novels ?? [], 'setting', setting.id))
  const [assets, setAssets] = useState(draft?.assets ?? [])
  const [tagsText, setTagsText] = useState(draft?.tagsText ?? editing.tags.join('，'))
  const [busy, setBusy] = useState(false)
  const isMap = editing.category === '地图'
  const currentDraft: SettingEditorDraft = { setting: editing, novelIds, assets, tagsText }

  useEffect(() => {
    saveEditorDraft<SettingEditorDraft>('setting', editing.id, { setting: editing, novelIds, assets, tagsText })
  }, [assets, editing, novelIds, tagsText])

  const backlinks = project.settings.flatMap((map) => map.category === '地图'
    ? mapMarkersForNovel(map, project, initialNovelId).filter((marker) => marker.locationId === editing.id || marker.organizations.some((link) => link.organizationId === editing.id)).map((marker) => ({ map, marker }))
    : [])
  const hasMapReferences = project.settings.some((item) => item.map?.markers.some((marker) => marker.locationId === editing.id || marker.organizations.some((link) => link.organizationId === editing.id)))

  function close() {
    if (busy) return
    saveEditorDraft('setting', editing.id, currentDraft)
    onClose()
  }

  function discard() {
    if (!window.confirm('丢弃本次未保存的修改？已保存的设定不会被删除。')) return
    clearEditorDraft('setting', editing.id)
    onClose()
  }

  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
    <aside className={`editor-drawer resource-editor setting-editor ${isMap ? 'map-editor-drawer' : ''}`} role="dialog" aria-modal="true" aria-label={isMap ? '编辑地图' : '编辑设定'} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}>
      <header className="drawer-header">
        <div className="editor-heading">{nested && <button className="icon-button" aria-label="返回上一份资料" disabled={busy} onClick={close}><ArrowLeft size={18} /></button>}<div><span className="eyebrow">{isMap ? '创作地图 · 私密资料' : '世界观词条'}</span><h2>{isMap ? '编辑地图' : '编辑设定'}</h2></div></div>
        <button className="icon-button" aria-label="关闭并保留草稿" disabled={busy} onClick={close}><X size={18} /></button>
      </header>
      <div className="resource-editor-body">
        <div className="resource-editor-title form-stack"><label>名称<input autoFocus value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label></div>
        <div className="resource-editor-columns">
          <main className="resource-writing form-stack">
            {isMap && <SettingMapEditor setting={editing} project={project} novelIds={novelIds} assets={[...(project.media ?? []), ...assets]} initialNovelId={initialNovelId} initialMarkerId={initialMarkerId}
              onChange={(map) => setEditing((current) => ({ ...current, map }))}
              onAsset={(asset, width, height) => { setAssets((current) => [...current, asset]); setEditing((current) => ({ ...current, map: { ...(current.map ?? emptyMap()), width, height, backgroundAssetId: asset.id } })) }}
              onOpen={(id, scope) => { const target = project.settings.find((item) => item.id === id); if (target) onOpen(target, undefined, scope) }} onCreateLocation={onCreateLocation} onBusy={setBusy} />}
            <label>一句话说明<textarea rows={2} value={editing.summary} onChange={(event) => setEditing({ ...editing, summary: event.target.value })} /></label>
            <label className="resource-details">{isMap ? '地图说明' : '详细设定'}<textarea rows={isMap ? 3 : 12} value={editing.details} onChange={(event) => setEditing({ ...editing, details: event.target.value })} placeholder={isMap ? '记录比例、地形或待校准的位置…' : '从这里展开你的世界…'} /></label>
            {backlinks.length > 0 && <section className="setting-map-backlinks"><strong>在地图中查看</strong>{backlinks.map(({ map, marker }) => <button className="ghost-button" key={`${map.id}-${marker.id}`} onClick={() => onOpen(map, marker.id)}><MapPin size={15} />{map.title} · {project.settings.find((item) => item.id === marker.locationId)?.title ?? marker.label}</button>)}</section>}
          </main>
          <details className="resource-properties" open={!isMap && window.innerWidth >= 1000}>
            <summary>属性 <span>{editing.category} · {stageLabels[editing.stage]}</span></summary>
            <div className="form-stack">
              <div className="compact-fields">
                <label>类别<select value={editing.category} disabled={isMap || hasMapReferences} onChange={(event) => { const category = event.target.value as SettingCategory; setEditing({ ...editing, category, ...(category === '地图' ? { map: emptyMap(), visibility: 'private' } : {}) }) }}>{settingCategories.map((item) => <option key={item}>{item}</option>)}</select>{hasMapReferences && <small>更改类别前请先解除地图引用。</small>}</label>
                <label>内容阶段<select value={editing.stage} onChange={(event) => setEditing({ ...editing, stage: event.target.value as ResourceStage })}>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
              <label>标签<input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="用逗号分隔" /></label>
              <div className="visibility-picker"><span>公开范围</span>{isMap ? <p>仅自己。地图底图、标记和驻地不会进入公开网站。</p> : <div><button className={editing.visibility === 'private' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'private' })}>仅自己</button><button className={editing.visibility === 'public' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'public' })}>可公开</button></div>}</div>
              <NovelLinkPicker novels={project.novels ?? []} value={novelIds} onChange={setNovelIds} />
              {isMap && <button className="ghost-button" disabled={busy} onClick={() => onCopy(currentDraft)}><Copy size={14} /> 复制为独立地图</button>}
            </div>
          </details>
        </div>
      </div>
      <footer className="drawer-footer resource-editor-footer">
        {project.settings.some((item) => item.id === editing.id) && <button className="danger-button" disabled={busy} onClick={onRemove}><Trash2 size={14} /> 删除</button>}
        <span>草稿仅暂存本机；保存后参与云同步</span>
        <button className="ghost-button" disabled={busy} onClick={discard}>丢弃草稿</button>
        <button className="ghost-button" disabled={busy} onClick={close}>{nested ? '返回' : '关闭'}</button>
        <button className="primary-button" disabled={busy || !editing.title.trim()} onClick={() => onSave({ ...currentDraft, setting: { ...editing, title: editing.title.trim(), tags: tagsText.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean), visibility: isMap ? 'private' : editing.visibility } })}>{isMap ? '保存地图' : '保存设定'}</button>
      </footer>
    </aside>
  </div>
}
