import { ArrowRight, BookOpenText, Boxes, FileText, GitFork, PenLine, UsersRound } from 'lucide-react'
import type { ViewKey } from '../components/Sidebar'
import type { NovelProject } from '../types'

export function HomeView({ project, onNavigate }: { project: NovelProject; onNavigate: (view: ViewKey) => void }) {
  const essays = project.essays ?? []
  const publicCount = essays.filter((essay) => essay.status === 'published').length
    + project.settings.filter((item) => item.visibility === 'public').length
    + project.characters.filter((item) => item.visibility === 'public').length
  const privateCount = essays.filter((essay) => essay.status !== 'published').length
    + project.settings.filter((item) => item.visibility === 'private').length
    + project.characters.filter((item) => item.visibility === 'private').length
  const activities = [
    ...essays.map((item) => ({ kind: '随笔', title: item.title, time: item.updatedAt, view: 'essays' as const })),
    ...project.chapters.map((item) => ({ kind: '章节', title: item.title, time: item.updatedAt, view: 'chapters' as const })),
    ...project.characters.map((item) => ({ kind: '角色', title: item.name, time: item.updatedAt, view: 'characters' as const })),
  ].slice(0, 5)

  return <div className="view-stack personal-dashboard">
    <section className="studio-hero">
      <div><span className="eyebrow">CACTUS / 掌仙人 · KEEP KEEN</span><h2>欢迎回来，祁珞。</h2><p>在这里整理公开表达，也安放尚未完成的故事。</p><div className="banner-actions"><button className="primary-button" onClick={() => onNavigate('essays')}><PenLine size={16} /> 写一篇随笔</button><button className="ghost-button" onClick={() => onNavigate('creation')}>进入创作空间 <ArrowRight size={15} /></button></div></div>
      <div className="studio-identity"><strong>KK</strong><span>VIRTUAL PERSONA</span></div>
    </section>
    <section className="stat-grid dashboard-stats">
      <article className="stat-card"><span className="stat-icon"><FileText size={18} /></span><div><small>公开内容</small><strong>{publicCount}</strong><em>将在下一次发布中可见</em></div></article>
      <article className="stat-card"><span className="stat-icon"><Boxes size={18} /></span><div><small>私密创作</small><strong>{privateCount}</strong><em>仅保存在当前浏览器</em></div></article>
      <article className="stat-card"><span className="stat-icon"><UsersRound size={18} /></span><div><small>角色档案</small><strong>{project.characters.length}</strong><em>{project.relationships.length} 条角色关系</em></div></article>
      <article className="stat-card"><span className="stat-icon"><BookOpenText size={18} /></span><div><small>小说章节</small><strong>{project.chapters.length}</strong><em>{project.chapters.reduce((sum, item) => sum + item.wordCount, 0).toLocaleString()} 字</em></div></article>
    </section>
    <section className="split-grid dashboard-bottom">
      <div className="panel"><div className="panel-heading"><div><span className="eyebrow">RECENT FOOTPRINTS</span><h3>最近足迹</h3></div></div><div className="activity-list">{activities.map((activity, index) => <button key={`${activity.kind}-${index}`} onClick={() => onNavigate(activity.view)}><span>{activity.kind}</span><strong>{activity.title}</strong><time>{activity.time}</time><ArrowRight size={14} /></button>)}</div></div>
      <div className="panel quick-entry"><span className="eyebrow">CREATION INDEX</span><h3>创作空间</h3><p>四个独立入口，一套清晰引用关系。</p><div><button onClick={() => onNavigate('settings')}><Boxes size={16} />设定集</button><button onClick={() => onNavigate('characters')}><UsersRound size={16} />角色档案</button><button onClick={() => onNavigate('graph')}><GitFork size={16} />关系图</button><button onClick={() => onNavigate('novels')}><BookOpenText size={16} />小说</button></div></div>
    </section>
  </div>
}
