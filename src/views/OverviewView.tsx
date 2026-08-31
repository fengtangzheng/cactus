import { ArrowRight, BookMarked, Boxes, FileText, GitFork, PenLine, UsersRound } from 'lucide-react'
import type { NovelProject } from '../types'
import type { ViewKey } from '../components/Sidebar'

interface OverviewViewProps {
  project: NovelProject
  onNavigate: (view: ViewKey) => void
}

export function OverviewView({ project, onNavigate }: OverviewViewProps) {
  const totalWords = project.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const stats = [
    { label: '正文总字数', value: totalWords.toLocaleString(), meta: '本周 +5,420', icon: FileText },
    { label: '设定条目', value: project.settings.length, meta: '1 条待完善', icon: Boxes },
    { label: '主要角色', value: project.characters.length, meta: `${project.relationships.length} 条关系`, icon: UsersRound },
    { label: '完成章节', value: project.chapters.filter((chapter) => chapter.status === 'ready').length, meta: `共 ${project.chapters.length} 章`, icon: BookMarked },
  ]

  return (
    <div className="view-stack">
      <section className="novel-banner">
        <div className="banner-copy">
          <span className="eyebrow">正在创作 · 长篇悬疑幻想</span>
          <h2>{project.title}</h2>
          <p>{project.subtitle}</p>
          <div className="banner-actions">
            <button className="primary-button" onClick={() => onNavigate('chapters')}><PenLine size={16} /> 继续写第三章</button>
            <button className="ghost-button" onClick={() => onNavigate('settings')}>查看作品设定 <ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="book-cover" aria-label={`${project.title} 封面`}>
          <span>CACTUS FICTION</span>
          <strong>雾都<br />来信</strong>
          <small>一封寄给遗忘之人的信</small>
        </div>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article className="stat-card" key={stat.label}>
              <span className="stat-icon"><Icon size={18} /></span>
              <div><small>{stat.label}</small><strong>{stat.value}</strong><em>{stat.meta}</em></div>
            </article>
          )
        })}
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">最近更新</span><h3>继续你的故事</h3></div>
            <button className="text-button" onClick={() => onNavigate('chapters')}>全部章节 <ArrowRight size={14} /></button>
          </div>
          <div className="chapter-list">
            {project.chapters.map((chapter, index) => (
              <button className="chapter-row" key={chapter.id} onClick={() => onNavigate('chapters')}>
                <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
                <span><strong>{chapter.title}</strong><small>{chapter.wordCount.toLocaleString()} 字 · {chapter.updatedAt}</small></span>
                <span className={`status ${chapter.status}`}>{chapter.status === 'ready' ? '已完成' : chapter.status === 'revising' ? '修订中' : '草稿'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel graph-teaser">
          <div className="panel-heading">
            <div><span className="eyebrow">故事网络</span><h3>角色关系</h3></div>
            <button className="icon-button" onClick={() => onNavigate('graph')}><ArrowRight size={17} /></button>
          </div>
          <div className="mini-graph">
            <span className="mini-edge edge-a" />
            <span className="mini-edge edge-b" />
            <span className="mini-edge edge-c" />
            {project.characters.slice(0, 4).map((character, index) => (
              <button
                key={character.id}
                className={`mini-node mini-node-${index + 1}`}
                style={{ '--node-color': character.color } as React.CSSProperties}
                onClick={() => onNavigate('graph')}
              >
                {character.name.slice(0, 1)}
                <span>{character.name}</span>
              </button>
            ))}
          </div>
          <button className="graph-link" onClick={() => onNavigate('graph')}><GitFork size={15} /> 打开关系图谱</button>
        </div>
      </section>
    </div>
  )
}
