import { ArrowUpRight, BookOpenCheck, Clock3, FolderKanban, GraduationCap, Plus } from 'lucide-react'
import { learning, notes, projects, type PersonalEntry } from '../personalData'

function EntryList({ entries, emptyLabel }: { entries: PersonalEntry[]; emptyLabel: string }) {
  return (
    <section className="content-board">
      {entries.map((entry) => (
        <article key={entry.id} className="content-board-row">
          <span className="content-kind">{entry.category}</span>
          <div><h3>{entry.title}</h3><p>{entry.excerpt}</p></div>
          <span className={`content-status ${entry.status}`}>{entry.status === 'published' ? '可公开' : '草稿'}</span>
          <time>{entry.date}</time>
          <button className="icon-button"><ArrowUpRight size={16} /></button>
        </article>
      ))}
      {entries.length === 0 && <p>{emptyLabel}</p>}
    </section>
  )
}

export function NotesView() {
  return <div className="view-stack"><section className="content-intro"><div><span className="eyebrow">NOTES & JOURNAL</span><h2>记录正在发生的事</h2><p>短想法、生活片段和阶段性判断，不要求每一篇都成为完整文章。</p></div><button className="primary-button"><Plus size={16} /> 新建记录</button></section><EntryList entries={notes} emptyLabel="还没有记录" /></div>
}

export function LearningView() {
  return <div className="view-stack"><section className="content-intro"><div><span className="eyebrow">LEARNING LOG</span><h2>把学习变成可回看的路径</h2><p>保存问题、资料、实验和结论，而不仅是一串收藏链接。</p></div><button className="primary-button"><GraduationCap size={16} /> 新建学习主题</button></section><div className="learning-grid">{learning.map((entry) => <article key={entry.id}><span><BookOpenCheck size={19} /></span><small>{entry.category}</small><h3>{entry.title}</h3><p>{entry.excerpt}</p><footer><Clock3 size={13} /> {entry.date}</footer></article>)}</div></div>
}

export function ProjectsView() {
  return <div className="view-stack"><section className="content-intro"><div><span className="eyebrow">PROJECTS</span><h2>正在做，也做过什么</h2><p>产品、写作和长期实验都放在这里，保留过程而不只展示结果。</p></div><button className="primary-button"><Plus size={16} /> 添加项目</button></section><div className="project-grid">{projects.map((project) => <article key={project.id} style={{ '--project-accent': project.accent } as React.CSSProperties}><span className="project-symbol"><FolderKanban size={20} /></span><small>{project.kind}</small><h3>{project.title}</h3><p>{project.summary}</p><footer><i /> {project.status}</footer></article>)}</div></div>
}
