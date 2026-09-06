import { useState } from 'react'
import { ArrowRight, BookOpenText, PenLine, Plus, Trash2, X } from 'lucide-react'
import type { Novel, NovelProject } from '../types'

interface NovelsViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
  onOpen: (id: string) => void
}

const createNovel = (): Novel => ({
  id: `novel-${Date.now()}`,
  title: '未命名小说',
  subtitle: '',
  synopsis: '',
  status: 'idea',
  visibility: 'private',
  settingIds: [],
  characterIds: [],
  relationshipIds: [],
  chapterIds: [],
  updatedAt: '刚刚',
})

const statusLabels: Record<Novel['status'], string> = {
  idea: '构思中',
  drafting: '创作中',
  serializing: '连载中',
  completed: '已完成',
}

export function NovelsView({ project, onChange, onOpen }: NovelsViewProps) {
  const novels = project.novels ?? []
  const [editing, setEditing] = useState<Novel | null>(null)

  function saveNovel() {
    if (!editing?.title.trim()) return
    const exists = novels.some((novel) => novel.id === editing.id)
    const updated = { ...editing, updatedAt: '刚刚' }
    onChange({ ...project, novels: exists ? novels.map((novel) => novel.id === updated.id ? updated : novel) : [updated, ...novels] })
    setEditing(null)
    onOpen(updated.id)
  }

  function removeNovel(novel: Novel) {
    const chapterIds = new Set(novel.chapterIds)
    if (!window.confirm(`确认删除小说“${novel.title}”及其 ${novel.chapterIds.length} 个章节吗？关联的设定、角色和关系档案会保留。`)) return
    onChange({
      ...project,
      novels: novels.filter((item) => item.id !== novel.id),
      chapters: project.chapters.filter((chapter) => chapter.novelId !== novel.id && !chapterIds.has(chapter.id)),
    })
  }

  return <div className="view-stack">
    <section className="content-intro"><div><span className="eyebrow">FICTION ARCHIVE</span><h2>小说</h2><p>每部作品独立管理概览、引用资料与章节。</p></div><button className="primary-button" onClick={() => setEditing(createNovel())}><Plus size={16} /> 新建小说</button></section>
    <section className="novel-list">{novels.map((novel, index) => <article className="novel-list-row" key={novel.id}>
      <button className="novel-list-open" onClick={() => onOpen(novel.id)}>
        <span className="novel-list-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="novel-list-icon"><BookOpenText size={24} /></span>
        <span className="novel-list-copy"><small>{statusLabels[novel.status]}</small><strong>{novel.title}</strong><em>{novel.synopsis || '还没有填写作品简介。'}</em></span>
        <span className="novel-list-meta">{novel.chapterIds.length} 章 · {novel.updatedAt}</span><ArrowRight size={18} />
      </button>
      <div className="novel-row-actions"><button aria-label={`编辑${novel.title}`} onClick={() => setEditing(novel)}><PenLine size={15} /></button><button className="danger" aria-label={`删除${novel.title}`} onClick={() => removeNovel(novel)}><Trash2 size={15} /></button></div>
    </article>)}</section>
    {novels.length === 0 && <section className="novel-empty"><BookOpenText size={28} /><h3>还没有小说</h3><p>从一个标题和一句话开始。</p><button className="primary-button" onClick={() => setEditing(createNovel())}><Plus size={16} /> 新建小说</button></section>}

    {editing && <div className="drawer-backdrop" onMouseDown={() => setEditing(null)}><aside className="editor-drawer" onMouseDown={(event) => event.stopPropagation()}>
      <header className="drawer-header"><div><span className="eyebrow">FICTION PROFILE</span><h2>{editing.title}</h2></div><button className="icon-button" onClick={() => setEditing(null)}><X size={18} /></button></header>
      <div className="form-stack">
        <label>小说名称<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label>
        <label>副标题<input value={editing.subtitle} onChange={(event) => setEditing({ ...editing, subtitle: event.target.value })} /></label>
        <label>作品简介<textarea rows={7} value={editing.synopsis} onChange={(event) => setEditing({ ...editing, synopsis: event.target.value })} /></label>
        <label>创作状态<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Novel['status'] })}><option value="idea">构思中</option><option value="drafting">创作中</option><option value="serializing">连载中</option><option value="completed">已完成</option></select></label>
        <div className="visibility-picker"><span>公开范围</span><div><button className={editing.visibility === 'private' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'private' })}>仅自己</button><button className={editing.visibility === 'public' ? 'active' : ''} onClick={() => setEditing({ ...editing, visibility: 'public' })}>可公开</button></div><small>新小说默认仅保存在本机。</small></div>
      </div>
      <footer className="drawer-footer"><button className="ghost-button" onClick={() => setEditing(null)}>取消</button><button className="primary-button" onClick={saveNovel}>保存并打开</button></footer>
    </aside></div>}
  </div>
}
