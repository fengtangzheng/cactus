import { ArrowRight, BookOpen, MapPin, Menu, Users } from 'lucide-react'
import type { PublicSnapshot } from './types'

export function PublicSite({ snapshot }: { snapshot: PublicSnapshot }) {
  const { siteTitle, work } = snapshot
  const chapters = work.chapters.filter((chapter) => chapter.published)

  return (
    <div className="reader-site">
      <nav className="reader-nav">
        <a className="reader-brand" href="#top">{siteTitle}</a>
        <div className="reader-links">
          <a href="#work">作品</a>
          <a href="#world">世界</a>
          <a href="#characters">人物</a>
          <a href="#about">关于</a>
        </div>
        <button className="menu-button" aria-label="打开菜单"><Menu size={18} /></button>
      </nav>

      <main id="top">
        <section className="reader-hero" id="work">
          <div className="hero-copy">
            <span className="kicker">A NOVEL IN PROGRESS · {work.status}</span>
            <h1>{work.title}</h1>
            <p className="subtitle">{work.subtitle}</p>
            <p className="synopsis">{work.synopsis}</p>
            <div className="hero-actions">
              <a href="#chapters"><BookOpen size={17} /> 从第一章开始</a>
              <span>已完成 {work.wordCount.toLocaleString()} 字</span>
            </div>
          </div>
          <div className="hero-mark" aria-hidden="true">雾</div>
        </section>

        <section className="content-section chapters-section" id="chapters">
          <header><span className="kicker">READ THE STORY</span><h2>最新章节</h2></header>
          <div className="chapter-list">
            {chapters.map((chapter, index) => (
              <article key={chapter.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{chapter.title}</h3><p>{chapter.excerpt}</p></div>
                <button aria-label={`阅读${chapter.title}`}><ArrowRight size={18} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section" id="world">
          <header><span className="kicker">THE WORLD</span><h2>进入雾城</h2></header>
          <div className="setting-grid">
            {work.settings.map((setting) => (
              <article key={setting.id}><MapPin size={18} /><small>{setting.category}</small><h3>{setting.title}</h3><p>{setting.summary}</p></article>
            ))}
          </div>
        </section>

        <section className="content-section character-section" id="characters">
          <header><span className="kicker">DRAMATIS PERSONAE</span><h2>故事中的人</h2></header>
          <div className="character-grid">
            {work.characters.map((character) => (
              <article key={character.id}>
                <span className="portrait" style={{ '--character-color': character.color } as React.CSSProperties}>{character.name.slice(0, 1)}</span>
                <div><small>{character.role}</small><h3>{character.name}</h3><p>{character.motivation}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <Users size={24} />
          <span className="kicker">ABOUT THE AUTHOR</span>
          <h2>{siteTitle}</h2>
          <p>持续写作，也持续修改。这个站点记录故事抵达读者之前的最后一段路。</p>
        </section>
      </main>
    </div>
  )
}
