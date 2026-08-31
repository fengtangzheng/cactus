import { useMemo, useState } from 'react'
import { EyeOff, Filter, Plus, Search, Shield, Sparkles, X } from 'lucide-react'
import { VisibilityBadge } from '../components/VisibilityBadge'
import type { Character, NovelProject } from '../types'

interface CharactersViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
}

const palette = ['#54705f', '#7d6b5b', '#af6a4a', '#4d6175', '#8a625e', '#6c6d45']

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
  updatedAt: '刚刚',
})

export function CharactersView({ project, onChange }: CharactersViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')
  const [editing, setEditing] = useState<Character | null>(null)

  const characters = useMemo(() => project.characters.filter((character) => {
    const matchesQuery = `${character.name}${character.alias}${character.role}${character.faction}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || character.visibility === filter
    return matchesQuery && matchesFilter
  }), [filter, project.characters, query])

  function saveCharacter() {
    if (!editing || !editing.name.trim()) return
    const exists = project.characters.some((character) => character.id === editing.id)
    onChange({
      ...project,
      characters: exists
        ? project.characters.map((character) => character.id === editing.id ? { ...editing, updatedAt: '刚刚' } : character)
        : [{ ...editing, updatedAt: '刚刚' }, ...project.characters],
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
          <button className="primary-button" onClick={() => setEditing(newCharacter())}><Plus size={16} /> 新建角色</button>
        </div>
      </section>

      <section className="character-grid">
        {characters.map((character) => {
          const relationshipCount = project.relationships.filter((relationship) => relationship.sourceId === character.id || relationship.targetId === character.id).length
          return (
            <button className="character-card" key={character.id} onClick={() => setEditing(character)}>
              <div className="portrait" style={{ '--character-color': character.color } as React.CSSProperties}>
                <span>{character.name.slice(0, 1)}</span>
                {character.visibility === 'private' && <i><EyeOff size={12} /></i>}
              </div>
              <div className="character-card-body">
                <div className="character-name-row"><h3>{character.name}</h3><VisibilityBadge value={character.visibility} /></div>
                <p className="character-role">{character.role}</p>
                <p className="character-description">{character.personality || '还没有填写角色性格。'}</p>
                <div className="character-meta"><span><Shield size={13} /> {character.faction}</span><span>{relationshipCount} 条关系</span></div>
              </div>
            </button>
          )
        })}
        <button className="character-card add-character" onClick={() => setEditing(newCharacter())}>
          <span><Plus size={22} /></span><strong>创造一个新角色</strong><small>从名字和欲望开始</small>
        </button>
      </section>

      {editing && (
        <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}>
          <aside className="editor-drawer character-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-header">
              <div className="drawer-character-title">
                <span className="small-portrait" style={{ '--character-color': editing.color } as React.CSSProperties}>{editing.name.slice(0, 1)}</span>
                <div><span className="eyebrow">角色档案</span><h2>{editing.name}</h2></div>
              </div>
              <button className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button>
            </header>
            <div className="form-stack two-column-form">
              <label>姓名<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label>
              <label>别名<input value={editing.alias} onChange={(event) => setEditing({ ...editing, alias: event.target.value })} /></label>
              <label>角色定位<input value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })} /></label>
              <label>阵营 / 组织<input value={editing.faction} onChange={(event) => setEditing({ ...editing, faction: event.target.value })} /></label>
              <label>年龄<input value={editing.age} onChange={(event) => setEditing({ ...editing, age: event.target.value })} /></label>
              <label>识别色<input type="color" value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></label>
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
              <div className="ai-hint form-wide"><Sparkles size={16} /><span><strong>角色弧光</strong> 后续会基于章节引用展示变化轨迹，不自动续写角色。</span></div>
            </div>
            <footer className="drawer-footer"><button className="ghost-button" onClick={() => setEditing(null)}>取消</button><button className="primary-button" onClick={saveCharacter}>保存角色</button></footer>
          </aside>
        </div>
      )}
    </div>
  )
}
