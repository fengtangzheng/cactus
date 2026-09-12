import { useEffect, useMemo, useRef, useState } from 'react'
import { EyeOff, Filter, Plus, Search, Shield, Trash2, X } from 'lucide-react'
import { VisibilityBadge } from '../components/VisibilityBadge'
import { CharacterMediaLibrary } from '../components/CharacterMediaLibrary'
import { NovelLinkPicker } from '../components/NovelLinkPicker'
import { ResourceMetaBadges } from '../components/ResourceMetaBadges'
import { clearEditorDraft, listEditorDrafts, loadEditorDraft, saveEditorDraft } from '../editorDrafts'
import { deleteMediaBlob } from '../mediaStorage'
import { getLinkedNovelIds, getResourceScope, setResourceNovelIds, stageLabels } from '../resourceLinks'
import type { Character, HistoricalImportance, HistoryPeriod, NovelProject, ResourceStage } from '../types'

interface CharactersViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
  onOpenGraph: (characterId: string) => void
  initialCharacterId?: string | null
}

const palette = ['#54705f', '#7d6b5b', '#af6a4a', '#4d6175', '#8a625e', '#6c6d45']
const CHARACTER_DRAFT_SCOPE = 'character'
const historyPeriods: HistoryPeriod[] = ['上古史', '中古史', '近世史', '现代史']
const importanceLevels: HistoricalImportance[] = ['核心', '重要', '补充']

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
  const [editorTab, setEditorTab] = useState<'profile' | 'media' | 'links'>('profile')
  const openedInitialId = useRef<string | undefined>(undefined)
  const [scopeFilter, setScopeFilter] = useState<'all' | 'independent' | 'exclusive' | 'shared' | `novel:${string}`>('all')
  const [stageFilter, setStageFilter] = useState<'all' | ResourceStage>('all')
  const [periodFilter, setPeriodFilter] = useState<'all' | HistoryPeriod>('all')
  const [polityFilter, setPolityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [importanceFilter, setImportanceFilter] = useState<'all' | HistoricalImportance>('all')
  const novels = project.novels ?? []
  const historicalCharacters = project.characters.filter((character) => character.historical)
  const historyOptions = {
    polity: Array.from(new Set(historicalCharacters.flatMap((character) => character.historical?.polity ?? []))).sort(),
    type: Array.from(new Set(historicalCharacters.flatMap((character) => character.historical?.types ?? []))).sort(),
    domain: Array.from(new Set(historicalCharacters.flatMap((character) => character.historical?.domains ?? []))).sort(),
  }
  const newDrafts = listEditorDrafts<CharacterEditorDraft>(CHARACTER_DRAFT_SCOPE).filter((draft) => draft.value?.character && !project.characters.some((character) => character.id === draft.id))

  useEffect(() => {
    if (editing) saveEditorDraft<CharacterEditorDraft>(CHARACTER_DRAFT_SCOPE, editing.id, { character: editing, novelIds: editingNovelIds })
  }, [editing, editingNovelIds])

  useEffect(() => {
    if (!initialCharacterId || openedInitialId.current === initialCharacterId) return
    openedInitialId.current = initialCharacterId
    const character = project.characters.find((item) => item.id === initialCharacterId) ?? null
    if (!character) {
      setEditing(null)
      setEditingNovelIds([])
      return
    }
    openEditor(character)
  }, [initialCharacterId, novels, project.characters])

  const characters = useMemo(() => project.characters.filter((character) => {
    const matchesQuery = `${character.name}${character.alias}${character.role}${character.faction}${character.historical?.era ?? ''}${character.historical?.domains.join('') ?? ''}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || character.visibility === filter
    const linkedNovelIds = getLinkedNovelIds(novels, 'character', character.id)
    const scope = getResourceScope(linkedNovelIds)
    const scopeMatches = scopeFilter === 'all' || scopeFilter === scope || (scopeFilter.startsWith('novel:') && linkedNovelIds.includes(scopeFilter.slice(6)))
    const stageMatches = stageFilter === 'all' || character.stage === stageFilter
    const history = character.historical
    const periodMatches = periodFilter === 'all' || history?.periods.includes(periodFilter)
    const polityMatches = polityFilter === 'all' || history?.polity.includes(polityFilter)
    const typeMatches = typeFilter === 'all' || history?.types.includes(typeFilter)
    const domainMatches = domainFilter === 'all' || history?.domains.includes(domainFilter)
    const importanceMatches = importanceFilter === 'all' || history?.importance === importanceFilter
    return matchesQuery && matchesFilter && scopeMatches && stageMatches && periodMatches && polityMatches && typeMatches && domainMatches && importanceMatches
  }), [domainFilter, filter, importanceFilter, novels, periodFilter, polityFilter, project.characters, query, scopeFilter, stageFilter, typeFilter])

  function openEditor(character: Character) {
    const draft = loadEditorDraft<CharacterEditorDraft>(CHARACTER_DRAFT_SCOPE, character.id)
    setEditing(draft?.character ?? character)
    setEditingNovelIds(draft?.novelIds ?? getLinkedNovelIds(novels, 'character', character.id))
    setEditorTab('profile')
  }

  function closeEditor() {
    setEditing(null)
  }

  function discardEditor() {
    if (!editing || !window.confirm('丢弃本次未保存的人物设定修改？媒体库中的操作已单独保存。')) return
    clearEditorDraft(CHARACTER_DRAFT_SCOPE, editing.id)
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
        <label>分期<select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value as typeof periodFilter)}><option value="all">全部分期</option>{historyPeriods.map((period) => <option key={period} value={period}>{period}</option>)}</select></label>
        <label>政权<select value={polityFilter} onChange={(event) => setPolityFilter(event.target.value)}><option value="all">全部政权</option>{historyOptions.polity.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>类型<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">全部类型</option>{historyOptions.type.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>领域<select value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}><option value="all">全部领域</option>{historyOptions.domain.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>重要度<select value={importanceFilter} onChange={(event) => setImportanceFilter(event.target.value as typeof importanceFilter)}><option value="all">全部级别</option>{importanceLevels.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <span className="filter-result-count">显示 {characters.length} / {project.characters.length}</span>
      </section>

      {newDrafts.length > 0 && <section className="setting-draft-list"><span>未保存的新角色</span>{newDrafts.map((draft) => <button key={draft.id} className="ghost-button" onClick={() => openEditor(draft.value.character)}>继续草稿：{draft.value.character.name}</button>)}</section>}
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
                {character.historical && <div className="history-meta-row"><span>{character.historical.periods.join(' · ')}</span><span>{character.historical.importance}</span></div>}
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
          <aside className="editor-drawer character-drawer resource-editor" role="dialog" aria-modal="true" aria-label="编辑角色" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-header">
              <div className="drawer-character-title">
                <span className="small-portrait" style={{ '--character-color': editing.color } as React.CSSProperties}>{editing.name.slice(0, 1)}</span>
                <div><span className="eyebrow">角色档案</span><h2>{editing.name}</h2></div>
              </div>
              <button className="icon-button" aria-label="关闭并保留草稿" onClick={closeEditor}><X size={18} /></button>
            </header>
            <nav className="resource-editor-tabs" aria-label="角色编辑分区">{([['profile', '人物设定'], ['media', '图片视频'], ['links', '关联资料']] as const).map(([value, label]) => <button key={value} className={editorTab === value ? 'active' : ''} aria-pressed={editorTab === value} onClick={() => setEditorTab(value)}>{label}</button>)}</nav>
            <div className="character-editor-scroll">
            <div hidden={editorTab !== 'profile'}>
            <div className="character-profile-layout">
            <div className="form-stack character-basics">
              <label>姓名<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label>
              <label>别名<input value={editing.alias} onChange={(event) => setEditing({ ...editing, alias: event.target.value })} /></label>
              <label>角色定位<input value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })} /></label>
              <label>阵营 / 组织<input value={editing.faction} onChange={(event) => setEditing({ ...editing, faction: event.target.value })} /></label>
              <label>年龄<input value={editing.age} onChange={(event) => setEditing({ ...editing, age: event.target.value })} /></label>
              <label>识别色<input type="color" value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></label>
              <label>内容阶段<select value={editing.stage} onChange={(event) => setEditing({ ...editing, stage: event.target.value as ResourceStage })}>{Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {editing.historical && <><label>历史分期<input value={editing.historical.periods.join('、')} readOnly /></label><label>重要度<select value={editing.historical.importance} onChange={(event) => setEditing({ ...editing, historical: { ...editing.historical!, importance: event.target.value as HistoricalImportance } })}>{importanceLevels.map((value) => <option key={value}>{value}</option>)}</select></label><label>历史时期<input value={editing.historical.era} onChange={(event) => setEditing({ ...editing, age: event.target.value, historical: { ...editing.historical!, era: event.target.value } })} /></label><label>人物类型<input value={editing.historical.types.join('、')} readOnly /></label><label>历史领域<input value={editing.historical.domains.join('、')} readOnly /></label></>}
            </div>
            <div className="form-stack character-writing">
              <label className="form-wide">外貌<textarea rows={3} value={editing.appearance} onChange={(event) => setEditing({ ...editing, appearance: event.target.value })} /></label>
              <label className="form-wide">性格<textarea rows={3} value={editing.personality} onChange={(event) => setEditing({ ...editing, personality: event.target.value })} /></label>
              <label className="form-wide">核心欲望<textarea rows={3} value={editing.motivation} onChange={(event) => setEditing({ ...editing, motivation: event.target.value })} /></label>
              <label className="form-wide secret-field"><span><EyeOff size={14} /> 作者秘密</span><textarea rows={3} value={editing.secret} onChange={(event) => setEditing({ ...editing, secret: event.target.value })} /><small>该字段无论角色是否公开，都不会出现在公开主页。</small></label>
            </div></div></div>
            <div hidden={editorTab !== 'links'} className="form-stack character-links">
              <div className="visibility-picker">
                <span>角色公开范围</span>
                <div>
                  <button className={editing.visibility === 'private' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'private' })}>仅自己</button>
                  <button className={editing.visibility === 'public' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'public' })}>可公开</button>
                </div>
              </div>
              <div className="form-wide"><NovelLinkPicker novels={novels} value={editingNovelIds} onChange={setEditingNovelIds} /></div>
              <div className="form-wide character-link-row"><button className="ghost-button" onClick={() => { const id = editing.id; setEditing(null); onOpenGraph(id) }}>在关系图中查看</button><span>{project.relationships.filter((relationship) => relationship.sourceId === editing.id || relationship.targetId === editing.id).length} 条关联关系</span></div>
            </div>
            <div hidden={editorTab !== 'media'} className="form-stack character-media-tab"><CharacterMediaLibrary characterId={editing.id} assets={(project.media ?? []).filter((asset) => asset.characterId === editing.id).sort((a, b) => a.sortOrder - b.sortOrder)} onChange={updateCharacterMedia} /></div>
            </div>
            <footer className="drawer-footer resource-editor-footer">{project.characters.some((character) => character.id === editing.id) && <button className="danger-button" onClick={() => void removeCharacter()}><Trash2 size={14} /> 删除角色</button>}<span>人物草稿暂存本机</span><button className="ghost-button" onClick={discardEditor}>丢弃草稿</button><button className="ghost-button" onClick={closeEditor}>关闭</button><button className="primary-button" onClick={saveCharacter}>保存角色</button></footer>
          </aside>
        </div>
      )}
    </div>
  )
}
