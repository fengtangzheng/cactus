import { ArrowRight, BookOpen, FolderKanban, GraduationCap, Menu, NotebookPen, Users } from 'lucide-react'
import type { PublicSnapshot } from './types'

export function PublicSite({ snapshot }: { snapshot: PublicSnapshot }) {
  const { siteTitle, profile, notes, learning, projects, work } = snapshot
  const chapters = work.chapters.filter((chapter) => chapter.published)

  return (
    <div className="reader-site">
      <nav className="reader-nav">
        <a className="reader-brand" href="#top">{siteTitle}</a>
        <div className="reader-links">
          <a href="#notes">记录</a>
          <a href="#learning">学习</a>
          <a href="#projects">项目</a>
          <a href="#creation">创作</a>
          <a href="#about">关于</a>
        </div>
        <button className="menu-button" aria-label="打开菜单"><Menu size={18} /></button>
      </nav>

      <main id="top">
        <section className="reader-hero" id="home">
          <div className="hero-copy">
            <span className="kicker">PERSONAL HOME · @{profile.handle}</span>
            <h1>{profile.name}</h1>
            <p className="subtitle">{profile.tagline}</p>
            <p className="synopsis">{profile.introduction}</p>
            <div className="hero-actions">
              <a href="#notes"><NotebookPen size={17} /> 看看最近记录</a>
              <span>记录 · 学习 · 项目 · 创作</span>
            </div>
          </div>
          <div className="hero-mark" aria-hidden="true">正</div>
        </section>

        <section className="content-section chapters-section" id="notes">
          <header><span className="kicker">NOTES & JOURNAL</span><h2>最近记录</h2></header>
          <div className="chapter-list">
            {notes.map((note, index) => (
              <article key={note.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><small>{note.category} · {note.date}</small><h3>{note.title}</h3><p>{note.excerpt}</p></div>
                <button aria-label={`阅读${note.title}`}><ArrowRight size={18} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section" id="learning">
          <header><span className="kicker">LEARNING LOG</span><h2>最近在学</h2></header>
          <div className="setting-grid">
            {learning.map((entry) => (
              <article key={entry.id}><GraduationCap size={18} /><small>{entry.category} · {entry.date}</small><h3>{entry.title}</h3><p>{entry.excerpt}</p></article>
            ))}
          </div>
        </section>

        <section className="content-section projects-public-section" id="projects">
          <header><span className="kicker">SELECTED PROJECTS</span><h2>正在做的项目</h2></header>
          <div className="project-public-grid">
            {projects.map((project) => (
              <article key={project.id} style={{ '--project-accent': project.accent } as React.CSSProperties}>
                <FolderKanban size={20} /><small>{project.kind}</small><h3>{project.title}</h3><p>{project.summary}</p><footer>{project.status}</footer>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section creation-section" id="creation">
          <div className="creation-copy"><span className="kicker">FICTION IN PROGRESS · {work.status}</span><h2>{work.title}</h2><p className="creation-subtitle">{work.subtitle}</p><p>{work.synopsis}</p><a href="#chapters"><BookOpen size={16} /> 查看创作进度</a></div>
          <div className="creation-cover"><small>CACTUS FICTION</small><strong>雾都<br />来信</strong><span>{work.wordCount.toLocaleString()} 字</span></div>
        </section>

        <section className="content-section fiction-progress" id="chapters">
          <header><span className="kicker">WRITING</span><h2>小说进度</h2></header>
          <div className="chapter-list">{chapters.map((chapter, index) => <article key={chapter.id}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{chapter.title}</h3><p>{chapter.excerpt}</p></div><button aria-label={`阅读${chapter.title}`}><ArrowRight size={18} /></button></article>)}</div>
        </section>

        <section className="about-section" id="about">
          <Users size={24} />
          <span className="kicker">ABOUT THE AUTHOR</span>
          <h2>{profile.name}</h2>
          <p>持续记录、持续学习，也持续创作。这里不是一份完成的简历，而是一个正在生长的个人空间。</p>
        </section>
      </main>
    </div>
  )
}
