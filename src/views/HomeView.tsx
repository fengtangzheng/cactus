import { ArrowRight, BookOpen, FolderKanban, GraduationCap, PenLine, Sparkles } from 'lucide-react'
import type { ViewKey } from '../components/Sidebar'
import { learning, notes, profile, projects } from '../personalData'
import type { NovelProject } from '../types'

export function HomeView({ project, onNavigate }: { project: NovelProject; onNavigate: (view: ViewKey) => void }) {
  return (
    <div className="view-stack personal-dashboard">
      <section className="personal-hero-card">
        <div>
          <span className="eyebrow">PERSONAL SPACE · {profile.handle}</span>
          <h2>{profile.tagline}</h2>
          <p>{profile.introduction}</p>
          <div className="banner-actions">
            <button className="primary-button" onClick={() => onNavigate('notes')}><PenLine size={16} /> 写一条记录</button>
            <button className="ghost-button" onClick={() => onNavigate('learning')}>整理学习笔记 <ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="personal-seal"><span>FTZ</span><small>记录 · 学习 · 创作</small></div>
      </section>

      <section className="personal-module-grid">
        <button onClick={() => onNavigate('notes')}><span><PenLine size={18} /></span><strong>记录</strong><small>{notes.length} 篇内容</small><ArrowRight size={15} /></button>
        <button onClick={() => onNavigate('learning')}><span><GraduationCap size={18} /></span><strong>学习</strong><small>{learning.length} 个主题</small><ArrowRight size={15} /></button>
        <button onClick={() => onNavigate('projects')}><span><FolderKanban size={18} /></span><strong>项目</strong><small>{projects.length} 个进行中</small><ArrowRight size={15} /></button>
        <button onClick={() => onNavigate('fiction')}><span><BookOpen size={18} /></span><strong>小说创作</strong><small>{project.chapters.length} 个章节</small><ArrowRight size={15} /></button>
      </section>

      <section className="split-grid personal-split">
        <div className="panel">
          <div className="panel-heading"><div><span className="eyebrow">RECENT NOTES</span><h3>最近记录</h3></div><button className="text-button" onClick={() => onNavigate('notes')}>查看全部 <ArrowRight size={14} /></button></div>
          <div className="personal-feed">
            {notes.map((note) => <button key={note.id} onClick={() => onNavigate('notes')}><span>{note.category}</span><div><strong>{note.title}</strong><small>{note.excerpt}</small></div><time>{note.date}</time></button>)}
          </div>
        </div>
        <div className="panel focus-card">
          <span className="focus-icon"><Sparkles size={18} /></span>
          <span className="eyebrow">CURRENT FOCUS</span>
          <h3>正在做的事</h3>
          <p>把 Cactus 从单一小说工具，扩展成一个真正会长期使用的个人内容系统。</p>
          <button className="ghost-button" onClick={() => onNavigate('projects')}>查看项目 <ArrowRight size={14} /></button>
        </div>
      </section>
    </div>
  )
}
