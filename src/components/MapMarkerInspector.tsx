import { useState } from 'react'
import { ArrowUpRight, Trash2, X } from 'lucide-react'
import type { MapMarker, MapOrganization, Novel, SettingEntry } from '../types'

interface Props {
  marker: MapMarker
  locations: SettingEntry[]
  organizations: SettingEntry[]
  novels: Novel[]
  onChange: (marker: MapMarker) => void
  onOpen: (id: string) => void
  onCreateLocation: (title: string) => void
  onRemove: () => void
}

export function MapMarkerInspector({ marker, locations, organizations, novels, onChange, onOpen, onCreateLocation, onRemove }: Props) {
  const [newTitle, setNewTitle] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [kind, setKind] = useState<MapOrganization['kind']>('总部')
  const location = locations.find((item) => item.id === marker.locationId)

  return <section className="map-inspector form-stack">
    <div className="map-inspector-heading"><strong>{location?.title ?? '临时标记'}</strong><button type="button" className="icon-button" aria-label="删除标记" onClick={onRemove}><Trash2 size={16} /></button></div>
    {!marker.locationId && <label>标记名称<input value={marker.label} onChange={(event) => onChange({ ...marker, label: event.target.value })} /></label>}
    <label>关联地点<select value={marker.locationId ?? ''} onChange={(event) => {
      const target = locations.find((item) => item.id === event.target.value)
      onChange({ ...marker, locationId: target?.id, label: target?.title ?? marker.label })
    }}><option value="">临时灵感（未关联）</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    {location && <button className="ghost-button" onClick={() => onOpen(location.id)}>查看地点设定 <ArrowUpRight size={14} /></button>}
    {!marker.locationId && <div className="map-new-location"><label>新地点名称<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={marker.label} /></label><button className="ghost-button" disabled={!(newTitle || marker.label).trim()} onClick={() => { onCreateLocation((newTitle || marker.label).trim()); setNewTitle('') }}>创建地点并关联</button><small>立即保存地点资料；地图位置在保存地图后同步。</small></div>}
    <label>标记备注<textarea rows={2} value={marker.note} onChange={(event) => onChange({ ...marker, note: event.target.value })} /></label>
    <fieldset className="map-scope-options"><legend>标记所属小说</legend>
      {novels.map((novel) => <label key={novel.id}><input type="checkbox" checked={marker.novelIds.includes(novel.id)} onChange={(event) => onChange({ ...marker, novelIds: event.target.checked ? [...marker.novelIds, novel.id] : marker.novelIds.filter((id) => id !== novel.id) })} />{novel.title}</label>)}
      <small>不勾选则仅显示在全部资料视图。小说还需关联地点和组织，才会显示对应资料。</small>
    </fieldset>
    <div className="map-organizations"><strong>组织驻地</strong>
      {marker.organizations.map((link) => {
        const organization = organizations.find((item) => item.id === link.organizationId)
        return organization && <div key={link.organizationId} className="map-organization-row"><button className="text-button" onClick={() => onOpen(organization.id)}>{organization.title} · {link.kind}</button><button className="icon-button" aria-label={`移除驻地 ${organization.title}`} onClick={() => onChange({ ...marker, organizations: marker.organizations.filter((item) => item.organizationId !== link.organizationId) })}><X size={14} /></button></div>
      })}
      <label>添加组织<select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}><option value="">选择已有组织</option>{organizations.filter((item) => !marker.organizations.some((link) => link.organizationId === item.id)).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <div className="compact-fields"><label>驻地类型<select value={kind} onChange={(event) => setKind(event.target.value as MapOrganization['kind'])}><option>总部</option><option>分部</option><option>据点</option></select></label><button className="ghost-button" disabled={!organizationId} onClick={() => { onChange({ ...marker, organizations: [...marker.organizations, { organizationId, kind }] }); setOrganizationId('') }}>添加驻地</button></div>
      <small>先在设定集中创建组织，再关联总部或多个分部。</small>
    </div>
  </section>
}
