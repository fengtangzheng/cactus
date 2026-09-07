import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, FilePenLine, MoreHorizontal, Plus, X } from 'lucide-react'
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from '../editorDrafts'
import type { Chapter, NovelProject } from '../types'

const CHAPTER_DRAFT_SCOPE = 'chapter'

export function ChaptersView({ project, novelId, onChange, onBack }: { project: NovelProject; novelId?: string; onChange: (project: NovelProject) => void; onBack: () => void }) {
  const novel = project.novels?.find((item) => item.id === novelId) ?? project.novels?.[0]
  const chapters = useMemo(() => project.chapters.filter((chapter) => !novel || novel.chapterIds.includes(chapter.id)), [novel, project.chapters])
  const [editing, setEditing] = useState<Chapter | null>(null)

  useEffect(() => {
    if (editing) saveEditorDraft(CHAPTER_DRAFT_SCOPE, editing.id, editing)
  }, [editing])

  function openEditor(chapter: Chapter) {
    setEditing(loadEditorDraft<Chapter>(CHAPTER_DRAFT_SCOPE, chapter.id) ?? chapter)
  }

  function closeEditor() {
    if (editing) clearEditorDraft(CHAPTER_DRAFT_SCOPE, editing.id)
    setEditing(null)
  }

  function createChapter() {
    openEditor({ id: `chapter-${Date.now()}`, title: '未命名章节', status: 'draft', wordCount: 0, updatedAt: '刚刚', novelId: novel?.id, content: '' })
  }

  function saveChapter() {
    if (!editing?.title.trim()) return
    const wordCount = editing.content?.replace(/\s/g, '').length ?? editing.wordCount
    const updated = { ...editing, wordCount, updatedAt: '刚刚' }
    const exists = project.chapters.some((chapter) => chapter.id === updated.id)
    const nextNovels = (project.novels ?? []).map((item) => item.id === novel?.id && !item.chapterIds.includes(updated.id) ? { ...item, chapterIds: [...item.chapterIds, updated.id], updatedAt: '刚刚' } : item)
    clearEditorDraft(CHAPTER_DRAFT_SCOPE, updated.id)
    onChange({ ...project, chapters: exists ? project.chapters.map((chapter) => chapter.id === updated.id ? updated : chapter) : [...project.chapters, updated], novels: nextNovels })
    setEditing(null)
  }

  return (
    <div className="view-stack">
      <nav className="context-nav" aria-label="章节导航"><button onClick={onBack}><ArrowLeft size={15} /> 返回小说概览</button><span>{novel?.title ?? '小说'} / 章节</span></nav>
      <section className="chapter-workspace-head">
        <div><span className="eyebrow">{novel?.title ?? '正文'}</span><h2>章节与正文</h2><p>章节内容仅保存在本机；只有标记完成并发布的内容才会进入公开快照。</p></div>
        <button className="primary-button" onClick={createChapter}><Plus size={16} /> 新建章节</button>
      </section>
      <section className="chapter-board">
        {chapters.map((chapter, index) => (
          <article className="chapter-board-row" key={chapter.id} onDoubleClick={() => openEditor(chapter)}>
            <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="chapter-doc-icon"><FilePenLine size={18} /></span>
            <div><h3>{chapter.title}</h3><p>{chapter.wordCount.toLocaleString()} 字 · 更新于 {chapter.updatedAt}</p></div>
            <span className={`status ${chapter.status}`}>{chapter.status === 'ready' ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{chapter.status === 'ready' ? '已完成' : chapter.status === 'revising' ? '修订中' : '草稿'}</span>
            <button className="icon-button" onClick={() => openEditor(chapter)} aria-label={`编辑${chapter.title}`}><MoreHorizontal size={17} /></button>
          </article>
        ))}
      </section>
      {editing && <div className="drawer-backdrop" onMouseDown={closeEditor}><aside className="editor-drawer chapter-editor-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header"><div><span className="eyebrow">CHAPTER EDITOR</span><h2>{editing.title}</h2></div><button className="icon-button" onClick={closeEditor}><X size={18} /></button></header>
        <div className="chapter-editor-body"><input className="chapter-title-input" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /><textarea aria-label="章节正文" placeholder="从这里开始写……" value={editing.content ?? ''} onChange={(event) => setEditing({ ...editing, content: event.target.value })} /></div>
        <footer className="drawer-footer chapter-editor-footer"><label>章节状态<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Chapter['status'] })}><option value="draft">草稿</option><option value="revising">修订中</option><option value="ready">已完成</option></select></label><span>{(editing.content ?? '').replace(/\s/g, '').length.toLocaleString()} 字</span><button className="ghost-button" onClick={closeEditor}>取消</button><button className="primary-button" onClick={saveChapter}>保存章节</button></footer>
      </aside></div>}
    </div>
  )
}
