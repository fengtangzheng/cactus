import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookMarked, Boxes, FileText, GitFork, PenLine, UsersRound } from 'lucide-react'
import type { NovelProject } from '../types'
import type { ViewKey } from '../components/Sidebar'
import { NovelReferenceManager, type ReferenceKind } from '../components/NovelReferenceManager'

interface OverviewViewProps {
  project: NovelProject
  novelId?: string
  onNavigate: (view: ViewKey) => void
  onBack: () => void
  onChange: (project: NovelProject) => void
  onOpenGraph: () => void
}

export function OverviewView({ project, novelId, onNavigate, onBack, onChange, onOpenGraph }: OverviewViewProps) {
  const [referenceKind, setReferenceKind] = useState<ReferenceKind | null>(null)
  const novel = project.novels?.find((item) => item.id === novelId) ?? project.novels?.[0]
  const chapters = project.chapters.filter((chapter) => !novel || novel.chapterIds.includes(chapter.id))
  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const settings = project.settings.filter((setting) => !novel || novel.settingIds.includes(setting.id))
  const characters = project.characters.filter((character) => !novel || novel.characterIds.includes(character.id))
  const relationships = project.relationships.filter((relationship) => !novel || novel.relationshipIds.includes(relationship.id))
  const stats = [
    { label: '正文总字数', value: totalWords.toLocaleString(), meta: '本周 +5,420', icon: FileText },
    { label: '关联设定', value: settings.length, meta: '从独立设定集引用', icon: Boxes },
    { label: '关联角色', value: characters.length, meta: `${relationships.length} 条关系`, icon: UsersRound },
    { label: '完成章节', value: chapters.filter((chapter) => chapter.status === 'ready').length, meta: `共 ${chapters.length} 章`, icon: BookMarked },
  ]

  return (
    <div className="view-stack">
      <nav className="context-nav" aria-label="小说导航"><button onClick={onBack}><ArrowLeft size={15} /> 返回小说列表</button><span>小说 / {novel?.title ?? project.title}</span></nav>
      <section className="novel-banner">
        <div className="banner-copy">
          <span className="eyebrow">正在创作 · 长篇悬疑幻想</span>
          <h2>{novel?.title ?? project.title}</h2>
          <p>{novel?.subtitle ?? project.subtitle}</p>
          <div className="banner-actions">
            <button className="primary-button" onClick={() => onNavigate('chapters')}><PenLine size={16} /> {chapters.length > 0 ? '继续写作' : '开始写第一章'}</button>
            <button className="ghost-button" onClick={() => setReferenceKind('setting')}>管理作品资料 <ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="book-cover" aria-label={`${project.title} 封面`}>
          <span>CACTUS FICTION</span>
          <strong>{(novel?.title ?? project.title).slice(0, 2)}<br />{(novel?.title ?? project.title).slice(2)}</strong>
          <small>一封寄给遗忘之人的信</small>
        </div>
      </section>

      {novel && <section className="novel-reference-grid">
        <article><span><Boxes size={18} /></span><div><small>SETTING REFERENCES</small><h3>设定引用</h3><p>{settings.length} 条设定属于这部小说。</p></div><button onClick={() => setReferenceKind('setting')}>管理设定 <ArrowRight size={14} /></button></article>
        <article><span><UsersRound size={18} /></span><div><small>CHARACTER REFERENCES</small><h3>角色引用</h3><p>{characters.length} 位角色参与这部小说。</p></div><button onClick={() => setReferenceKind('character')}>管理角色 <ArrowRight size={14} /></button></article>
        <article><span><GitFork size={18} /></span><div><small>RELATION REFERENCES</small><h3>关系引用</h3><p>{relationships.length} 条关系进入当前故事。</p></div><button onClick={() => setReferenceKind('relationship')}>管理关系 <ArrowRight size={14} /></button></article>
      </section>}

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
            {chapters.map((chapter, index) => (
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
            <button className="icon-button" onClick={onOpenGraph}><ArrowRight size={17} /></button>
          </div>
          <div className="mini-graph">
            <span className="mini-edge edge-a" />
            <span className="mini-edge edge-b" />
            <span className="mini-edge edge-c" />
            {characters.slice(0, 4).map((character, index) => (
              <button
                key={character.id}
                className={`mini-node mini-node-${index + 1}`}
                style={{ '--node-color': character.color } as React.CSSProperties}
                onClick={onOpenGraph}
              >
                {character.name.slice(0, 1)}
                <span>{character.name}</span>
              </button>
            ))}
          </div>
          <button className="graph-link" onClick={onOpenGraph}><GitFork size={15} /> 打开当前小说关系图</button>
        </div>
      </section>
      {referenceKind && novel && <NovelReferenceManager project={project} novel={novel} kind={referenceKind} onChange={onChange} onClose={() => setReferenceKind(null)} />}
    </div>
  )
}
