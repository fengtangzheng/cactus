import { ArrowLeft, ArrowRight, BookOpen, NotebookPen } from 'lucide-react'
import { createPublicSnapshot } from '../publicSnapshot'
import type { NovelProject } from '../types'

export function PublicPreview({ project, onClose }: { project: NovelProject; onClose: () => void }) {
  const snapshot = createPublicSnapshot(project)
  const novel = snapshot.novels[0]
  return <div className="public-site personal-public-preview"><nav className="public-nav"><button onClick={onClose}><ArrowLeft size={15} /> 返回工作台</button><strong>Cactus / 掌仙人</strong><div><a href="#notes">随笔</a><a href="#creation">创作</a><a href="#about">关于</a></div></nav><main>
    <section className="public-hero personal-preview-hero"><span className="public-kicker">VIRTUAL PERSONA · KK</span><h1>KEEP KEEN.</h1><p className="public-subtitle">保持敏锐，也保持热忱。</p><p className="public-synopsis">{snapshot.profile.introduction}</p><div><button><NotebookPen size={16} /> 阅读最近随笔</button><span>祁珞 / Kiro · KK / 卡卡</span></div></section>
    <section className="public-section" id="notes"><span className="public-kicker">NOTES & ESSAYS</span><h2>最近随笔</h2><div className="public-setting-grid">{snapshot.essays.map((essay) => <article key={essay.id}><NotebookPen size={17} /><small>{essay.category} · {essay.date}</small><h3>{essay.title}</h3><p>{essay.excerpt}</p></article>)}</div></section>
    {novel && <section className="preview-fiction" id="creation"><div><span className="public-kicker">FICTION IN PROGRESS</span><h2>{novel.title}</h2><p>{novel.subtitle}</p><small>{novel.synopsis}</small><button><BookOpen size={16} /> 查看作品概览 <ArrowRight size={14} /></button></div><span className="preview-fiction-mark">雾</span></section>}
    <section className="public-about" id="about"><span className="public-kicker">ABOUT · VIRTUAL PERSONA</span><h2>祁珞 / Kiro</h2><p>清冷慢热，重视边界；在风沙与荒芜里，仍愿意保留热忱。</p></section>
    {snapshot.gallery.length > 0 && <section className="public-section public-preview-gallery-section"><span className="public-kicker">KIRO VISUAL ARCHIVE</span><h2>祁珞影像档案</h2><div className="public-preview-gallery">{snapshot.gallery.map((item) => <article key={item.id}>{item.type === 'video' ? <video src={item.url} controls preload="metadata" /> : <img src={item.url} alt={item.title} loading="lazy" />}<strong>{item.title}</strong><small>{item.caption}</small></article>)}</div></section>}
  </main></div>
}
