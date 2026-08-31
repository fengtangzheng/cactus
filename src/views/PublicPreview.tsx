import { ArrowLeft, BookOpen, MapPin, Users } from 'lucide-react'
import type { NovelProject } from '../types'

export function PublicPreview({ project, onClose }: { project: NovelProject; onClose: () => void }) {
  const publicCharacters = project.characters.filter((character) => character.visibility === 'public')
  const publicSettings = project.settings.filter((setting) => setting.visibility === 'public')

  return (
    <div className="public-site">
      <nav className="public-nav">
        <button onClick={onClose}><ArrowLeft size={15} /> 返回创作区</button>
        <strong>{project.penName}</strong>
        <div><a href="#works">作品</a><a href="#world">世界</a><a href="#characters">人物</a><a href="#about">关于</a></div>
      </nav>
      <main>
        <section className="public-hero">
          <span className="public-kicker">A NOVEL IN PROGRESS · 连载中</span>
          <h1>{project.title}</h1>
          <p className="public-subtitle">{project.subtitle}</p>
          <p className="public-synopsis">{project.synopsis}</p>
          <div><button><BookOpen size={16} /> 从第一章开始</button><span>已完成 {project.chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0).toLocaleString()} 字</span></div>
        </section>
        <section className="public-section" id="world">
          <span className="public-kicker">THE WORLD</span><h2>进入雾城</h2>
          <div className="public-setting-grid">
            {publicSettings.map((setting) => <article key={setting.id}><MapPin size={17} /><small>{setting.category}</small><h3>{setting.title}</h3><p>{setting.summary}</p></article>)}
          </div>
        </section>
        <section className="public-section character-section" id="characters">
          <span className="public-kicker">DRAMATIS PERSONAE</span><h2>故事中的人</h2>
          <div className="public-character-grid">
            {publicCharacters.map((character) => <article key={character.id}><span style={{ '--character-color': character.color } as React.CSSProperties}>{character.name.slice(0, 1)}</span><div><small>{character.role}</small><h3>{character.name}</h3><p>{character.motivation}</p></div></article>)}
          </div>
        </section>
        <section className="public-about" id="about"><Users size={23} /><span className="public-kicker">ABOUT THE AUTHOR</span><h2>{project.penName}</h2><p>持续写作，也持续修改。这个站点记录故事抵达读者之前的最后一段路。</p></section>
      </main>
    </div>
  )
}
