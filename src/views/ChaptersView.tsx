import { CheckCircle2, Clock3, FilePenLine, MoreHorizontal, Plus } from 'lucide-react'
import type { NovelProject } from '../types'

export function ChaptersView({ project }: { project: NovelProject }) {
  return (
    <div className="view-stack">
      <section className="chapter-workspace-head">
        <div><span className="eyebrow">正文</span><h2>章节与场景</h2><p>编辑器将在下一阶段接入；当前先验证作品结构、设定和人物网络。</p></div>
        <button className="primary-button"><Plus size={16} /> 新建章节</button>
      </section>
      <section className="chapter-board">
        {project.chapters.map((chapter, index) => (
          <article className="chapter-board-row" key={chapter.id}>
            <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="chapter-doc-icon"><FilePenLine size={18} /></span>
            <div><h3>{chapter.title}</h3><p>{chapter.wordCount.toLocaleString()} 字 · 更新于 {chapter.updatedAt}</p></div>
            <span className={`status ${chapter.status}`}>{chapter.status === 'ready' ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{chapter.status === 'ready' ? '已完成' : chapter.status === 'revising' ? '修订中' : '草稿'}</span>
            <button className="icon-button"><MoreHorizontal size={17} /></button>
          </article>
        ))}
      </section>
    </div>
  )
}
