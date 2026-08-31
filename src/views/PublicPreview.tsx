import { ArrowLeft, BookOpen, FolderKanban, GraduationCap, NotebookPen, Users } from 'lucide-react'
import { learning, notes, profile, projects } from '../personalData'
import type { NovelProject } from '../types'

export function PublicPreview({ project, onClose }: { project: NovelProject; onClose: () => void }) {
  return (
    <div className="public-site personal-public-preview">
      <nav className="public-nav">
        <button onClick={onClose}><ArrowLeft size={15} /> 返回工作台</button>
        <strong>{profile.name}</strong>
        <div><a href="#notes">记录</a><a href="#learning">学习</a><a href="#projects">项目</a><a href="#creation">创作</a></div>
      </nav>
      <main>
        <section className="public-hero personal-preview-hero">
          <span className="public-kicker">PERSONAL HOME · @{profile.handle}</span>
          <h1>{profile.name}</h1>
          <p className="public-subtitle">{profile.tagline}</p>
          <p className="public-synopsis">{profile.introduction}</p>
          <div><button><NotebookPen size={16} /> 看看最近记录</button><span>记录 · 学习 · 项目 · 创作</span></div>
        </section>

        <section className="public-section" id="notes">
          <span className="public-kicker">NOTES & JOURNAL</span><h2>最近记录</h2>
          <div className="public-setting-grid">{notes.filter((note) => note.status === 'published').map((note) => <article key={note.id}><NotebookPen size={17} /><small>{note.category} · {note.date}</small><h3>{note.title}</h3><p>{note.excerpt}</p></article>)}</div>
        </section>

        <section className="public-section character-section" id="learning">
          <span className="public-kicker">LEARNING LOG</span><h2>最近在学</h2>
          <div className="public-character-grid">{learning.filter((entry) => entry.status === 'published').map((entry) => <article key={entry.id}><span style={{ '--character-color': '#6d7d6c' } as React.CSSProperties}><GraduationCap size={20} /></span><div><small>{entry.category}</small><h3>{entry.title}</h3><p>{entry.excerpt}</p></div></article>)}</div>
        </section>

        <section className="public-section" id="projects">
          <span className="public-kicker">PROJECTS</span><h2>正在做的项目</h2>
          <div className="public-setting-grid">{projects.map((item) => <article key={item.id}><FolderKanban size={17} /><small>{item.kind} · {item.status}</small><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div>
        </section>

        <section className="preview-fiction" id="creation">
          <div><span className="public-kicker">FICTION IN PROGRESS</span><h2>{project.title}</h2><p>{project.subtitle}</p><small>{project.synopsis}</small><button><BookOpen size={16} /> 查看创作进度</button></div>
          <span className="preview-fiction-mark">雾</span>
        </section>

        <section className="public-about"><Users size={23} /><span className="public-kicker">ABOUT</span><h2>{profile.name}</h2><p>持续记录、持续学习，也持续创作。这里不是一份完成的简历，而是一个正在生长的个人空间。</p></section>
      </main>
    </div>
  )
}
