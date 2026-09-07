import { useEffect, useMemo, useState } from 'react'
import { EyeOff, Filter, Plus, Search, Shield, Sparkles, Trash2, X } from 'lucide-react'
import { VisibilityBadge } from '../components/VisibilityBadge'
import { CharacterMediaLibrary } from '../components/CharacterMediaLibrary'
import { NovelLinkPicker } from '../components/NovelLinkPicker'
import { ResourceMetaBadges } from '../components/ResourceMetaBadges'
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from '../editorDrafts'
import { deleteMediaBlob } from '../mediaStorage'
import { getLinkedNovelIds, getResourceScope, setResourceNovelIds, stageLabels } from '../resourceLinks'
import type { Character, NovelProject, ResourceStage } from '../types'

interface CharactersViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
  onOpenGraph: (characterId: string) => void
  initialCharacterId?: string | null
}

const palette = ['#54705f', '#7d6b5b', '#af6a4a', '#4d6175', '#8a625e', '#6c6d45']
const CHARACTER_DRAFT_SCOPE = 'character'

interface CharacterEditorDraft {
  character: Character
  novelIds: string[]
}

const newCharacter = (): Character => ({
  id: `character-${Date.now()}`,
  name: '未命名角色',
  alias: '',
  role: '配角',
  faction: '未归属',
  age: '',
  appearance: '',
  personality: '',
  motivation: '',
  secret: '',
  color: palette[Math.floor(Math.random() * palette.length)],
  visibility: 'private',
  stage: 'inspiration',
  updatedAt: '刚刚',
  mediaIds: [],
})

export function CharactersView({ project, onChange, onOpenGraph, initialCharacterId }: CharactersViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [editing, setEditing] = useState<Character | null>(null)
  const [editingNovelIds, setEditingNovelIds] = useState<string[]>([])
  const [scopeFilter, setScopeFilter] = useState<'all' | 'independent' | 'exclusive' | 'shared' | `novel:${string}`>('all')
  const [stageFilter, setStageFilter] = useState<'all' | ResourceStage>('all')
  const novels = project.novels ?? []

  useEffect(() => {
    if (editing) saveEditorDraft<CharacterEditorDraft>(CHARACTER_DRAFT_SCOPE, editing.id, { character: editing, novelIds: editingNovelIds })
  }, [editing, editingNovelIds])

  useEffect(() => {
    if (!initialCharacterId) return
    const character = project.characters.find((item) => item.id === initialCharacterId) ?? null
    if (!character) {
      setEditing(null)
      setEditingNovelIds([])
      return
    }
    openEditor(character)
  }, [initialCharacterId, novels, project.characters])

  const characters = useMemo(() => project.characters.filter((character) => {
    const matchesQuery = `${character.name}${character.alias}${character.role}${character.faction}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || character.visibility === filter
    const linkedNovelIds = getLinkedNovelIds(novels, 'character', character.id)
    const scope = getResourceScope(linkedNovelIds)
    const scopeMatches = scopeFilter === 'all' || scopeFilter === scope || (scopeFilter.startsWith('novel:') && linkedNovelIds.includes(scopeFilter.slice(6)))
    const stageMatches = stageFilter === 'all' || character.stage === stageFilter
    return matchesQuery && matchesFilter && scopeMatches && stageMatches
  }), [filter, novels, project.characters, query, scopeFilter, stageFilter])

  function openEditor(character: Character) {
    const draft = loadEditorDraft<CharacterEditorDraft>(CHARACTER_DRAFT_SCOPE, character.id)
    setEditing(draft?.character ?? character)
    setEditingNovelIds(draft?.novelIds ?? getLinkedNovelIds(novels, 'character', character.id))
  }

  function closeEditor() {
    if (editing) clearEditorDraft(CHARACTER_DRAFT_SCOPE, editing.id)
    setEditing(null)
  }

  function saveCharacter() {
    if (!editing || !editing.name.trim()) return
    const exists = project.characters.some((character) => character.id === editing.id)
    const nextProject = {
      ...project,
      characters: exists
        ? project.characters.map((character) => character.id === editing.id ? { ...editing, updatedAt: '刚刚' } : character)
        : [{ ...editing, updatedAt: '刚刚' }, ...project.characters],
    }
    clearEditorDraft(CHARACTER_DRAFT_SCOPE, editing.id)
    onChange(setResourceNovelIds(nextProject, 'character', editing.id, editingNovelIds))
    setEditing(null)
  }

  function updateCharacterMedia(assets: NonNullable<NovelProject['media']>) {
    if (!editing) return
    const otherAssets = (project.media ?? []).filter((asset) => asset.characterId !== editing.id)
    const mediaIds = assets.map((asset) => asset.id)
    setEditing({ ...editing, mediaIds })
    onChange({ ...project, media: [...otherAssets, ...assets] })
  }

  async function removeCharacter() {
    if (!editing) return
    const relationshipCount = project.relationships.filter((relationship) => relationship.sourceId === editing.id || relationship.targetId === editing.id).length
    if (relationshipCount > 0) {
      window.alert(`该角色仍关联 ${relationshipCount} 条关系，请先在关系图中处理后再删除。`)
      return
    }
    if (!window.confirm(`确认删除角色“${editing.name}”及其本地媒体吗？此操作无法撤销。`)) return
    clearEditorDraft(CHARACTER_DRAFT_SCOPE, editing.id)
    const characterMedia = (project.media ?? []).filter((asset) => asset.characterId === editing.id)
    await Promise.all(characterMedia.map((asset) => asset.blobId ? deleteMediaBlob(asset.blobId) : Promise.resolve()))
    onChange({
      ...project,
      characters: project.characters.filter((character) => character.id !== editing.id),
      media: (project.media ?? []).filter((asset) => asset.characterId !== editing.id),
      novels: (project.novels ?? []).map((novel) => ({ ...novel, characterIds: novel.characterIds.filter((id) => id !== editing.id) })),
    })
    setEditing(null)
  }

  return (
    <div className="view-stack">
      <section className="toolbar-row">
        <div className="segmented-control">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部 {project.characters.length}</button>
          <button className={filter === 'public' ? 'active' : ''} onClick={() => setFilter('public')}>可公开</button>
          <button className={filter === 'private' ? 'active' : ''} onClick={() => setFilter('private')}>含秘密</button>
        </div>
        <div className="toolbar-actions">
          <label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索角色" /></label>
          <button className="square-button" aria-label="筛选"><Filter size={16} /></button>
          <button className="primary-button" onClick={() => openEditor(newCharacter())}><Plus size={16} /> 新建角色</button>
        </div>
      </section>

      <section className="resource-filter-bar">
        <label>归属<select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value as typeof scopeFilter)}><option value="all">全部范围</option><option value="independent">独立资料</option><option value="exclusive">小说专属</option><option value="shared">多作品共享</option>{novels.map((novel) => <option key={novel.id} value={`novel:${novel.id}`}>《{novel.title}》</option>)}</select></label>
        <label>阶段<select value={stageFilter} onChange={(event) => setStageFilter(event.target.value as typeof stageFilter)}><option value="all">全部阶段</option>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </section>

      <section className="character-grid">
        {characters.map((character) => {
          const relationshipCount = project.relationships.filter((relationship) => relationship.sourceId === character.id || relationship.targetId === character.id).length
          return (
            <button className="character-card" key={character.id} onClick={() => openEditor(character)}>
              <div className="portrait" style={{ '--character-color': character.color } as React.CSSProperties}>
                <span>{character.name.slice(0, 1)}</span>
                {character.visibility === 'private' && <i><EyeOff size={12} /></i>}
              </div>
              <div className="character-card-body">
                <div className="character-name-row"><h3>{character.name}</h3><VisibilityBadge value={character.visibility} /></div>
                <p className="character-role">{character.role}</p>
                <ResourceMetaBadges stage={character.stage} novelIds={getLinkedNovelIds(novels, 'character', character.id)} novels={novels} />
                <p className="character-description">{character.personality || '还没有填写角色性格。'}</p>
                <div className="character-meta"><span><Shield size={13} /> {character.faction}</span><span>{relationshipCount} 条关系</span></div>
              </div>
            </button>
          )
        })}
        <button className="character-card add-character" onClick={() => openEditor(newCharacter())}>
          <span><Plus size={22} /></span><strong>创造一个新角色</strong><small>从名字和欲望开始</small>
        </button>
      </section>

      {editing && (
        <div className="drawer-backdrop" onMouseDown={closeEditor}>
          <aside className="editor-drawer character-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-header">
              <div className="drawer-character-title">
                <span className="small-portrait" style={{ '--character-color': editing.color } as React.CSSProperties}>{editing.name.slice(0, 1)}</span>
                <div><span className="eyebrow">角色档案</span><h2>{editing.name}</h2></div>
              </div>
              <button className="icon-button" onClick={closeEditor}><X size={18} /></button>
            </header>
            <div className="form-stack two-column-form">
              <label>姓名<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label>
              <label>别名<input value={editing.alias} onChange={(event) => setEditing({ ...editing, alias: event.target.value })} /></label>
              <label>角色定位<input value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })} /></label>
              <label>阵营 / 组织<input value={editing.faction} onChange={(event) => setEditing({ ...editing, faction: event.target.value })} /></label>
              <label>年龄<input value={editing.age} onChange={(event) => setEditing({ ...editing, age: event.target.value })} /></label>
              <label>识别色<input type="color" value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></label>
              <label className="form-wide">内容阶段<select value={editing.stage} onChange={(event) => setEditing({ ...editing, stage: event.target.value as ResourceStage })}>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="form-wide">外貌<textarea rows={3} value={editing.appearance} onChange={(event) => setEditing({ ...editing, appearance: event.target.value })} /></label>
              <label className="form-wide">性格<textarea rows={3} value={editing.personality} onChange={(event) => setEditing({ ...editing, personality: event.target.value })} /></label>
              <label className="form-wide">核心欲望<textarea rows={3} value={editing.motivation} onChange={(event) => setEditing({ ...editing, motivation: event.target.value })} /></label>
              <label className="form-wide secret-field"><span><EyeOff size={14} /> 作者秘密</span><textarea rows={3} value={editing.secret} onChange={(event) => setEditing({ ...editing, secret: event.target.value })} /><small>该字段无论角色是否公开，都不会出现在公开主页。</small></label>
              <div className="visibility-picker form-wide">
                <span>角色公开范围</span>
                <div>
                  <button className={editing.visibility === 'private' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'private' })}>仅自己</button>
                  <button className={editing.visibility === 'public' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'public' })}>可公开</button>
                </div>
              </div>
              <div className="form-wide"><NovelLinkPicker novels={novels} value={editingNovelIds} onChange={setEditingNovelIds} /></div>
              <div className="form-wide character-link-row"><button className="ghost-button" onClick={() => { const id = editing.id; setEditing(null); onOpenGraph(id) }}>在关系图中查看</button><span>{project.relationships.filter((relationship) => relationship.sourceId === editing.id || relationship.targetId === editing.id).length} 条关联关系</span></div>
              <CharacterMediaLibrary characterId={editing.id} assets={(project.media ?? []).filter((asset) => asset.characterId === editing.id).sort((a, b) => a.sortOrder - b.sortOrder)} onChange={updateCharacterMedia} />
              <div className="ai-hint form-wide"><Sparkles size={16} /><span><strong>角色弧光</strong> 后续会基于章节引用展示变化轨迹，不自动续写角色。</span></div>
            </div>
            <footer className="drawer-footer character-footer">{project.characters.some((character) => character.id === editing.id) && <button className="danger-button" onClick={() => void removeCharacter()}><Trash2 size={14} /> 删除角色</button>}<span /><button className="ghost-button" onClick={closeEditor}>取消</button><button className="primary-button" onClick={saveCharacter}>保存角色</button></footer>
          </aside>
        </div>
      )}
    </div>
  )
}
