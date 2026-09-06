import { useMemo, useState } from 'react'
import { Boxes, GitFork, Plus, Search, UsersRound, X } from 'lucide-react'
import { ResourceMetaBadges } from './ResourceMetaBadges'
import { getLinkedNovelIds } from '../resourceLinks'
import type { Character, Novel, NovelProject, ResourceStage, SettingEntry } from '../types'

export type ReferenceKind = 'setting' | 'character' | 'relationship'

const kindMeta = {
  setting: { title: '管理设定引用', label: '设定', icon: Boxes, key: 'settingIds' as const },
  character: { title: '管理角色引用', label: '角色', icon: UsersRound, key: 'characterIds' as const },
  relationship: { title: '管理关系引用', label: '关系', icon: GitFork, key: 'relationshipIds' as const },
}

const createSetting = (title: string): SettingEntry => ({ id: `setting-${Date.now()}`, category: '世界', title, summary: '', details: '', tags: [], visibility: 'private', stage: 'inspiration', updatedAt: '刚刚' })
const createCharacter = (name: string): Character => ({ id: `character-${Date.now()}`, name, alias: '', role: '配角', faction: '未归属', age: '', appearance: '', personality: '', motivation: '', secret: '', color: '#54705f', visibility: 'private', stage: 'inspiration', updatedAt: '刚刚', mediaIds: [] })
interface ReferenceItem { id: string; title: string; meta: string; description: string; stage?: ResourceStage; novelIds?: string[] }

export function NovelReferenceManager({ project, novel, kind, onChange, onClose }: { project: NovelProject; novel: Novel; kind: ReferenceKind; onChange: (project: NovelProject) => void; onClose: () => void }) {
  const meta = kindMeta[kind]
  const [selectedIds, setSelectedIds] = useState<string[]>(novel[meta.key])
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const eligibleCharacterIds = new Set(novel.characterIds)
  const items = useMemo<ReferenceItem[]>(() => {
    if (kind === 'setting') return project.settings.map((item) => ({ id: item.id, title: item.title, meta: item.category, description: item.summary, stage: item.stage, novelIds: getLinkedNovelIds(project.novels ?? [], 'setting', item.id) }))
    if (kind === 'character') return project.characters.map((item) => ({ id: item.id, title: item.name, meta: item.role, description: item.personality, stage: item.stage, novelIds: getLinkedNovelIds(project.novels ?? [], 'character', item.id) }))
    return project.relationships
      .filter((item) => eligibleCharacterIds.has(item.sourceId) && eligibleCharacterIds.has(item.targetId))
      .map((item) => ({ id: item.id, title: item.label, meta: `${project.characters.find((character) => character.id === item.sourceId)?.name ?? '未知'} → ${project.characters.find((character) => character.id === item.targetId)?.name ?? '未知'}`, description: item.detail }))
  }, [eligibleCharacterIds, kind, project.characters, project.novels, project.relationships, project.settings])
  const visibleItems = items.filter((item) => `${item.title}${item.meta}${item.description}`.toLowerCase().includes(query.toLowerCase()))

  function toggle(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function save() {
    const selectedCharacters = new Set(kind === 'character' ? selectedIds : novel.characterIds)
    const validRelationshipIds = new Set(project.relationships
      .filter((relationship) => selectedCharacters.has(relationship.sourceId) && selectedCharacters.has(relationship.targetId))
      .map((relationship) => relationship.id))
    onChange({
      ...project,
      novels: (project.novels ?? []).map((item) => {
        if (item.id !== novel.id) return item
        if (kind === 'setting') return { ...item, settingIds: selectedIds, updatedAt: '刚刚' }
        if (kind === 'relationship') return { ...item, relationshipIds: selectedIds, updatedAt: '刚刚' }
        return { ...item, characterIds: selectedIds, relationshipIds: item.relationshipIds.filter((id) => validRelationshipIds.has(id)), updatedAt: '刚刚' }
      }),
    })
    onClose()
  }

  function createExclusiveResource() {
    if (kind === 'relationship' || !newTitle.trim()) return
    const resource = kind === 'setting' ? createSetting(newTitle.trim()) : createCharacter(newTitle.trim())
    const nextProject: NovelProject = kind === 'setting'
      ? { ...project, settings: [resource as SettingEntry, ...project.settings], novels: (project.novels ?? []).map((item) => item.id === novel.id ? { ...item, settingIds: [...item.settingIds, resource.id] } : item) }
      : { ...project, characters: [resource as Character, ...project.characters], novels: (project.novels ?? []).map((item) => item.id === novel.id ? { ...item, characterIds: [...item.characterIds, resource.id] } : item) }
    setSelectedIds((current) => [resource.id, ...current])
    onChange(nextProject)
    setNewTitle('')
    setCreating(false)
  }

  const Icon = meta.icon
  return <div className="drawer-backdrop" onMouseDown={onClose}><aside className="editor-drawer reference-drawer" onMouseDown={(event) => event.stopPropagation()}>
    <header className="drawer-header"><div><span className="eyebrow">{novel.title}</span><h2>{meta.title}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></header>
    <div className="reference-manager-body">
      <div className="reference-manager-toolbar"><label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${meta.label}`} /></label>{kind !== 'relationship' && <button className="ghost-button" onClick={() => setCreating(true)}><Plus size={14} /> 新建专属{meta.label}</button>}</div>
      {creating && <div className="reference-create-row"><input autoFocus value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder={`输入${meta.label}名称`} onKeyDown={(event) => { if (event.key === 'Enter') createExclusiveResource() }} /><button className="ghost-button" onClick={() => { setCreating(false); setNewTitle('') }}>取消</button><button className="primary-button" disabled={!newTitle.trim()} onClick={createExclusiveResource}>创建并关联</button></div>}
      {kind === 'relationship' && <p className="reference-rule">仅显示两端角色都已关联《{novel.title}》的关系。</p>}
      <div className="reference-select-list">{visibleItems.map((item) => <label key={item.id} className={selectedIds.includes(item.id) ? 'selected' : ''}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} /><span className="reference-icon"><Icon size={16} /></span><span><strong>{item.title}</strong><small>{item.meta}</small><em>{item.description || '暂无说明'}</em>{item.stage && <ResourceMetaBadges stage={item.stage} novelIds={item.novelIds ?? []} novels={project.novels ?? []} />}</span></label>)}</div>
      {visibleItems.length === 0 && <div className="reference-empty">没有符合条件的{meta.label}。</div>}
    </div>
    <footer className="drawer-footer"><span className="reference-selected-count">已选择 {selectedIds.length} 项</span><button className="ghost-button" onClick={onClose}>取消</button><button className="primary-button" onClick={save}>保存引用</button></footer>
  </aside></div>
}
