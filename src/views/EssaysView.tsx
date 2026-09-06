import { useMemo, useState } from 'react'
import { Archive, Eye, FilePenLine, Plus, Search, X } from 'lucide-react'
import type { Essay, EssayStatus, NovelProject } from '../types'

const createEssay = (): Essay => ({
  id: `essay-${Date.now()}`,
  slug: `untitled-${Date.now()}`,
  title: '未命名随笔',
  excerpt: '',
  content: '',
  category: '随笔',
  tags: [],
  status: 'draft',
  createdAt: new Date().toLocaleDateString('zh-CN'),
  updatedAt: '刚刚',
})

const statusLabel: Record<EssayStatus, string> = { draft: '草稿', published: '已发布', archived: '已归档' }

export function EssaysView({ project, onChange }: { project: NovelProject; onChange: (project: NovelProject) => void }) {
  const essays = project.essays ?? []
  const [filter, setFilter] = useState<'all' | EssayStatus>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Essay | null>(null)
  const visible = useMemo(() => essays.filter((essay) => {
    const matchesStatus = filter === 'all' || essay.status === filter
    const matchesQuery = `${essay.title}${essay.excerpt}${essay.tags.join('')}`.toLowerCase().includes(query.toLowerCase())
    return matchesStatus && matchesQuery
  }), [essays, filter, query])

  function save() {
    if (!editing?.title.trim()) return
    const normalized = { ...editing, slug: editing.slug.trim() || `essay-${Date.now()}`, updatedAt: '刚刚' }
    const exists = essays.some((essay) => essay.id === normalized.id)
    onChange({ ...project, essays: exists ? essays.map((essay) => essay.id === normalized.id ? normalized : essay) : [normalized, ...essays] })
    setEditing(null)
  }

  return <div className="view-stack">
    <section className="toolbar-row">
      <div className="segmented-control">
        {(['all', 'draft', 'published', 'archived'] as const).map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value === 'all' ? `全部 ${essays.length}` : statusLabel[value]}</button>)}
      </div>
      <div className="toolbar-actions">
        <label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索随笔" /></label>
        <button className="primary-button" onClick={() => setEditing(createEssay())}><Plus size={16} /> 新建随笔</button>
      </div>
    </section>
    <section className="essay-board">
      {visible.map((essay, index) => <button className="essay-row" key={essay.id} onClick={() => setEditing(essay)}>
        <span className="essay-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="essay-main"><small>{essay.category} · {essay.updatedAt}</small><strong>{essay.title}</strong><em>{essay.excerpt || '还没有填写摘要。'}</em></span>
        <span className={`content-status ${essay.status}`}>{essay.status === 'published' ? <Eye size={13} /> : essay.status === 'archived' ? <Archive size={13} /> : <FilePenLine size={13} />}{statusLabel[essay.status]}</span>
      </button>)}
    </section>
    {editing && <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}>
      <aside className="editor-drawer essay-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header"><div><span className="eyebrow">ESSAY EDITOR</span><h2>{editing.title}</h2></div><button className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button></header>
        <div className="form-stack">
          <label>标题<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
          <div className="two-column-form inline-form"><label>分类<input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} /></label><label>地址别名<input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} /></label></div>
          <label>摘要<textarea rows={3} value={editing.excerpt} onChange={(event) => setEditing({ ...editing, excerpt: event.target.value })} /></label>
          <label>正文<textarea className="essay-content-input" rows={16} value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} /></label>
          <label>标签（逗号分隔）<input value={editing.tags.join(', ')} onChange={(event) => setEditing({ ...editing, tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} /></label>
          <label>状态<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as EssayStatus })}><option value="draft">草稿</option><option value="published">已发布</option><option value="archived">已归档</option></select></label>
        </div>
        <footer className="drawer-footer"><button className="ghost-button" onClick={() => setEditing(null)}>取消</button><button className="primary-button" onClick={save}>保存随笔</button></footer>
      </aside>
    </div>}
  </div>
}
