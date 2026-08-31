import { useMemo, useState } from 'react'
import { ChevronRight, Filter, Plus, Search, Sparkles, X } from 'lucide-react'
import { VisibilityBadge } from '../components/VisibilityBadge'
import type { NovelProject, SettingCategory, SettingEntry } from '../types'

interface SettingsViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
}

const categories: Array<'全部' | SettingCategory> = ['全部', '世界', '地点', '组织', '规则', '物件']

const newSetting = (): SettingEntry => ({
  id: `setting-${Date.now()}`,
  category: '世界',
  title: '未命名设定',
  summary: '',
  details: '',
  tags: [],
  visibility: 'private',
  updatedAt: '刚刚',
})

export function SettingsView({ project, onChange }: SettingsViewProps) {
  const [category, setCategory] = useState<(typeof categories)[number]>('全部')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<SettingEntry | null>(null)

  const visibleSettings = useMemo(() => project.settings.filter((item) => {
    const categoryMatches = category === '全部' || item.category === category
    const queryMatches = `${item.title}${item.summary}${item.tags.join('')}`.toLowerCase().includes(query.toLowerCase())
    return categoryMatches && queryMatches
  }), [category, project.settings, query])

  function saveSetting() {
    if (!editing || !editing.title.trim()) return
    const exists = project.settings.some((item) => item.id === editing.id)
    onChange({
      ...project,
      settings: exists
        ? project.settings.map((item) => item.id === editing.id ? { ...editing, updatedAt: '刚刚' } : item)
        : [{ ...editing, updatedAt: '刚刚' }, ...project.settings],
    })
    setEditing(null)
  }

  return (
    <div className="view-stack">
      <section className="toolbar-row">
        <div className="segmented-control">
          {categories.map((item) => (
            <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <div className="toolbar-actions">
          <label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索设定" /></label>
          <button className="square-button" aria-label="筛选"><Filter size={16} /></button>
          <button className="primary-button" onClick={() => setEditing(newSetting())}><Plus size={16} /> 新建设定</button>
        </div>
      </section>

      <section className="setting-grid">
        {visibleSettings.map((item) => (
          <button className="setting-card" key={item.id} onClick={() => setEditing(item)}>
            <div className="setting-card-top">
              <span className={`category-icon category-${item.category}`}>{item.category.slice(0, 1)}</span>
              <VisibilityBadge value={item.visibility} />
            </div>
            <span className="eyebrow">{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.summary || '还没有补充一句话说明。'}</p>
            <div className="tag-row">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            <footer><small>更新于 {item.updatedAt}</small><ChevronRight size={15} /></footer>
          </button>
        ))}
        <button className="setting-card add-card" onClick={() => setEditing(newSetting())}>
          <span><Plus size={20} /></span><strong>添加新的设定</strong><small>地点、规则、组织或关键物件</small>
        </button>
      </section>

      {editing && (
        <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}>
          <aside className="editor-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-header">
              <div><span className="eyebrow">世界观词条</span><h2>编辑设定</h2></div>
              <button className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button>
            </header>
            <div className="form-stack">
              <label>名称<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
              <label>类别<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value as SettingCategory })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>一句话说明<textarea rows={2} value={editing.summary} onChange={(event) => setEditing({ ...editing, summary: event.target.value })} /></label>
              <label>详细设定<textarea rows={8} value={editing.details} onChange={(event) => setEditing({ ...editing, details: event.target.value })} /></label>
              <label>标签<input value={editing.tags.join('，')} onChange={(event) => setEditing({ ...editing, tags: event.target.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean) })} placeholder="用逗号分隔" /></label>
              <div className="visibility-picker">
                <span>公开范围</span>
                <div>
                  <button className={editing.visibility === 'private' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'private' })}>仅自己</button>
                  <button className={editing.visibility === 'public' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'public' })}>可公开</button>
                </div>
                <small>公开主页永远只读取标记为“可公开”的内容。</small>
              </div>
              <div className="ai-hint"><Sparkles size={16} /><span><strong>一致性检查</strong> 后续可提示设定冲突，首期不自动改写你的内容。</span></div>
            </div>
            <footer className="drawer-footer"><button className="ghost-button" onClick={() => setEditing(null)}>取消</button><button className="primary-button" onClick={saveSetting}>保存设定</button></footer>
          </aside>
        </div>
      )}
    </div>
  )
}
