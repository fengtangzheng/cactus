import { useEffect, useRef, useState } from 'react'
import type { Viewport } from '@xyflow/react'
import { ImagePlus, MapPin, Plus, Search } from 'lucide-react'
import { loadEditorDraft, saveEditorDraft } from '../editorDrafts'
import { saveMediaBlob } from '../mediaStorage'
import { emptyMap, mapMarkersForNovel, markerLabel } from '../settingMaps'
import { SettingMapCanvas } from './SettingMapCanvas'
import { MapMarkerInspector } from './MapMarkerInspector'
import type { MapMarker, MediaAsset, NovelProject, SettingEntry, SettingMap } from '../types'

interface Props {
  setting: SettingEntry
  project: NovelProject
  novelIds: string[]
  assets: MediaAsset[]
  initialNovelId?: string
  initialMarkerId?: string
  onChange: (map: SettingMap) => void
  onAsset: (asset: MediaAsset, width: number, height: number) => void
  onOpen: (id: string, novelId?: string) => void
  onCreateLocation: (title: string, novelIds: string[]) => string
  onBusy: (busy: boolean) => void
}

interface MapViewDraft { viewport?: Viewport; viewportSize?: { width: number; height: number }; selectedId?: string; scope: string }

export function SettingMapEditor({ setting, project, novelIds, assets, initialNovelId, initialMarkerId, onChange, onAsset, onOpen, onCreateLocation, onBusy }: Props) {
  const map = setting.map ?? emptyMap()
  const [savedView] = useState(() => loadEditorDraft<MapViewDraft>('map-view', setting.id))
  const [scope, setScope] = useState(initialNovelId ?? savedView?.scope ?? '')
  const [selectedId, setSelectedId] = useState(initialMarkerId ?? savedView?.selectedId)
  const [focusToken, setFocusToken] = useState(0)
  const [viewport, setViewport] = useState(savedView?.viewport)
  const [viewportSize, setViewportSize] = useState(savedView?.viewportSize)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [kindFilter, setKindFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const latest = useRef({ map, onAsset })
  latest.current = { map, onAsset }
  const novels = (project.novels ?? []).filter((novel) => novelIds.includes(novel.id))
  const activeScope = novels.some((novel) => novel.id === scope) ? scope : ''
  // 草稿归属尚未提交时，也用当前选择计算小说视图。
  const scopedProject = { ...project, novels: project.novels?.map((novel) => ({ ...novel, settingIds: novelIds.includes(novel.id) ? [...novel.settingIds, setting.id] : novel.settingIds.filter((id) => id !== setting.id) })) }
  const scopedMarkers = mapMarkersForNovel(setting, scopedProject, activeScope || undefined)
  const visibleMarkers = scopedMarkers.filter((marker) => {
    const names = [markerLabel(marker, project.settings), ...marker.organizations.map((link) => project.settings.find((item) => item.id === link.organizationId)?.title ?? '')].join(' ')
    return names.toLowerCase().includes(query.toLowerCase()) && (kindFilter === 'all' || (kindFilter === 'location' && marker.locationId) || (kindFilter === 'temporary' && !marker.locationId) || (kindFilter === 'organization' && marker.organizations.length > 0))
  })
  const selected = visibleMarkers.find((marker) => marker.id === selectedId)
  const selectedNovel = novels.find((novel) => novel.id === activeScope)
  const availableSettings = project.settings.filter((item) => !selectedNovel || selectedNovel.settingIds.includes(item.id))
  const background = assets.find((asset) => asset.id === map.backgroundAssetId)

  useEffect(() => { if (initialMarkerId) { setSelectedId(initialMarkerId); setQuery(''); setKindFilter('all') } }, [initialMarkerId])

  function remember(next: Partial<MapViewDraft>) {
    saveEditorDraft('map-view', setting.id, { viewport, viewportSize, selectedId, scope, ...next })
  }

  function updateMarker(marker: MapMarker) {
    // 筛选视图隐藏的组织引用不能因编辑其他字段而丢失。
    const original = map.markers.find((item) => item.id === marker.id)
    const hidden = original?.organizations.filter((link) => !availableSettings.some((item) => item.id === link.organizationId)) ?? []
    onChange({ ...map, markers: map.markers.map((item) => item.id === marker.id ? { ...marker, organizations: [...marker.organizations, ...hidden] } : item) })
  }

  function addMarker(x: number, y: number) {
    const marker: MapMarker = { id: `pin-${crypto.randomUUID()}`, x, y, label: '未命名地点', note: '', novelIds: activeScope ? [activeScope] : [...novelIds], organizations: [] }
    onChange({ ...map, markers: [...map.markers, marker] })
    setQuery(''); setKindFilter('all'); setSelectedId(marker.id); setAdding(false)
    remember({ selectedId: marker.id })
  }

  async function upload(file?: File) {
    if (!file) return
    setError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setError('请选择不超过 20 MB 的 PNG、JPG 或 WebP 图片。'); return
    }
    if (map.markers.length && !window.confirm('替换底图会保留标记的相对位置。新地形可能不同，请替换后校准。是否继续？')) return
    setUploading(true); onBusy(true)
    try {
      const bitmap = await createImageBitmap(file)
      const width = 1200
      const height = Math.round(1200 * bitmap.height / bitmap.width)
      bitmap.close()
      if (!width || !height) throw new Error('图片尺寸无效。')
      const id = `map-image-${crypto.randomUUID()}`
      await saveMediaBlob(id, file)
      latest.current.onAsset({ id, settingId: setting.id, type: 'image', role: 'map-base', title: file.name, caption: '', tags: [], visibility: 'private', sortOrder: 0, source: '本地上传', blobId: id, fileName: file.name, mimeType: file.type, size: file.size, createdAt: new Date().toISOString() }, width, height)
      setViewport(undefined); remember({ viewport: undefined })
    } catch (caught) { setError(caught instanceof Error ? caught.message : '图片读取失败，请重试。') }
    finally { setUploading(false); onBusy(false) }
  }

  return <section className="setting-map-editor">
    <div className="map-toolbar">
      <label className="ghost-button map-upload"><ImagePlus size={16} />{uploading ? '正在读取…' : map.backgroundAssetId ? '替换底图' : '上传底图'}<input type="file" aria-label="上传地图底图" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = '' }} /></label>
      {map.backgroundAssetId && <button className="ghost-button" disabled={uploading} onClick={() => { if (window.confirm('移除底图，保留所有标记并改用空白画布？')) onChange({ ...map, backgroundAssetId: undefined }) }}>使用空白画布</button>}
      <button className={adding ? 'primary-button' : 'ghost-button'} onClick={() => setAdding(!adding)}><Plus size={16} />{adding ? '取消放置' : '放置标记'}</button>
      <button className="ghost-button" onClick={() => addMarker(0.5, 0.5)}>在中央添加</button>
      <label className="map-scope-label">查看范围<select aria-label="地图小说范围" value={activeScope} onChange={(event) => { setScope(event.target.value); setSelectedId(undefined); remember({ scope: event.target.value, selectedId: undefined }) }}><option value="">全部资料</option>{novels.map((novel) => <option key={novel.id} value={novel.id}>{novel.title}</option>)}</select></label>
    </div>
    {error && <p className="editor-error" role="alert">{error}</p>}
    {!map.backgroundAssetId && <p className="map-intro">空白画布已就绪。先摆出地点，也可以上传手绘图或生成的无文字底图。</p>}
    <div className="map-workbench">
      <SettingMapCanvas key={map.backgroundAssetId ?? 'blank'} map={map} asset={background} markers={visibleMarkers.map((marker) => ({ ...marker, displayLabel: markerLabel(marker, project.settings) }))} selectedId={selectedId} focusToken={focusToken} adding={adding} viewport={viewport} viewportSize={viewportSize}
        onViewport={(next, size) => { setViewport(next); setViewportSize(size); remember({ viewport: next, viewportSize: size }) }}
        onSelect={(id) => { setSelectedId(id); remember({ selectedId: id }) }}
        onAdd={addMarker}
        onMove={(id, x, y) => onChange({ ...map, markers: map.markers.map((marker) => marker.id === id ? { ...marker, x, y } : marker) })} />
      <aside className="map-side-panel">
        <div className="map-search form-stack"><label><span><Search size={14} /> 搜索地点 / 组织</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入名称" /></label><select aria-label="标记类型" value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}><option value="all">全部标记</option><option value="location">地点</option><option value="organization">有组织驻地</option><option value="temporary">临时灵感</option></select></div>
        <div className="map-marker-list">{visibleMarkers.map((marker) => <button key={marker.id} className={marker.id === selectedId ? 'active' : ''} onClick={() => { setSelectedId(marker.id); setFocusToken((current) => current + 1); remember({ selectedId: marker.id }) }}><MapPin size={14} /><span>{markerLabel(marker, project.settings)}</span><small>{marker.organizations.length ? `${marker.organizations.length} 处驻地` : marker.locationId ? '地点' : '灵感'}</small></button>)}</div>
        {!visibleMarkers.length && <p className="map-intro">当前范围暂无标记。可放置新标记，或切换到全部资料。</p>}
        {selected && <MapMarkerInspector key={selected.id} marker={selected} locations={availableSettings.filter((item) => item.category === '地点')} organizations={availableSettings.filter((item) => item.category === '组织')} novels={novels} onChange={updateMarker} onOpen={(id) => onOpen(id, activeScope || undefined)}
          onRemove={() => { if (window.confirm('仅移除这个地图标记及驻地关联，保留地点和组织资料？')) { onChange({ ...map, markers: map.markers.filter((item) => item.id !== selected.id) }); setSelectedId(undefined) } }}
          onCreateLocation={(title) => { const locationId = onCreateLocation(title, selected.novelIds); updateMarker({ ...selected, locationId, label: title }) }} />}
      </aside>
    </div>
  </section>
}
