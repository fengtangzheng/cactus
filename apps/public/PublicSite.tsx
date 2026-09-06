import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, Menu, Play, X } from 'lucide-react'
import { ThemeSwitcher } from '../../src/components/ThemeSwitcher'
import type { PublicEssay, PublicMedia, PublicNovel, PublicSnapshot } from './types'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const asset = (path: string) => `${base}/${path.replace(/^\//, '')}`

function currentPath() {
  const value = window.location.pathname.replace(base, '') || '/'
  return value.length > 1 ? value.replace(/\/$/, '') : value
}

function Link({ to, children, className, onNavigate }: { to: string; children: ReactNode; className?: string; onNavigate: (path: string) => void }) {
  return <a href={`${base}${to}`} className={className} onClick={(event: MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); onNavigate(to) }}>{children}</a>
}

function Shell({ children, path, navigate }: { children: ReactNode; path: string; navigate: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const items = [['/essays', '随笔'], ['/creation', '创作'], ['/about', '关于']] as const
  return <div className="reader-site">
    <nav className="reader-nav"><Link to="/" className="reader-brand" onNavigate={navigate}><strong>Cactus</strong><span>掌仙人</span></Link><div className={menuOpen ? 'reader-links open' : 'reader-links'}>{items.map(([to, label]) => <Link key={to} to={to} className={path.startsWith(to) ? 'active' : ''} onNavigate={(next) => { setMenuOpen(false); navigate(next) }}>{label}</Link>)}</div><div className="reader-actions"><ThemeSwitcher storageKey="cactus-public-theme" compact /><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? '关闭菜单' : '打开菜单'}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div></nav>
    <main>{children}</main>
    <footer className="reader-footer"><div><strong>Cactus / 掌仙人</strong><span>祁珞的个人内容空间</span></div><p>KEEP KEEN · 保持敏锐，也保持热忱</p><small>VIRTUAL PERSONA · KK</small></footer>
  </div>
}

function Home({ snapshot, navigate }: { snapshot: PublicSnapshot; navigate: (path: string) => void }) {
  const novel = snapshot.novels[0]
  return <>
    <section className="reader-hero"><div className="hero-copy"><span className="kicker">CACTUS ARCHIVE · VIRTUAL PERSONA</span><h1>KEEP<br />KEEN.</h1><p className="hero-cn">保持敏锐，也保持热忱。</p><p className="synopsis">{snapshot.profile.introduction}</p><div className="hero-actions"><Link to="/essays" onNavigate={navigate}>阅读最近随笔 <ArrowRight size={16} /></Link><Link to="/about" className="text-link" onNavigate={navigate}>认识祁珞</Link></div></div><figure className="hero-portrait"><img src={asset('media/kk/hero-1200.webp?v=1.1')} alt="虚拟人物祁珞的半身主视觉" /><figcaption><span>VIRTUAL PERSONA · KK</span><strong>祁珞 / Kiro</strong></figcaption></figure></section>
    <section className="public-section latest-essays"><header><span className="kicker">01 · NOTES & ESSAYS</span><h2>最近随笔</h2><Link to="/essays" onNavigate={navigate}>全部文章 <ArrowRight size={14} /></Link></header><div className="essay-index-list">{snapshot.essays.slice(0, 3).map((essay, index) => <Link key={essay.id} to={`/essays/${essay.slug}`} onNavigate={navigate}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{essay.category} · {essay.date}</small><h3>{essay.title}</h3><p>{essay.excerpt}</p></div><ArrowRight size={18} /></Link>)}</div></section>
    {novel && <section className="public-section featured-fiction"><div><span className="kicker">02 · FICTION IN PROGRESS</span><h2>{novel.title}</h2><p className="fiction-subtitle">{novel.subtitle}</p><p>{novel.synopsis}</p><Link to={`/fiction/${novel.slug}`} onNavigate={navigate}><BookOpen size={16} /> 进入作品</Link></div><div className="fiction-metrics"><span><strong>{novel.wordCount.toLocaleString()}</strong>字</span><span><strong>{novel.characters.length}</strong>角色</span><span><strong>{novel.chapters.length}</strong>公开章节</span></div></section>}
    <section className="public-section meet-kk"><div><span className="kicker">03 · MEET KK</span><h2>祁珞，是 Cactus 的讲述者。</h2><p>清冷慢热，重视边界；在风沙与荒芜里，仍愿意保留热忱。</p><Link to="/about" onNavigate={navigate}>阅读人物小传 <ArrowRight size={15} /></Link></div><img src={asset('media/kk/face-800.webp?v=1.1')} alt="虚拟人物祁珞的脸部特写" /></section>
  </>
}

function Essays({ essays, navigate }: { essays: PublicEssay[]; navigate: (path: string) => void }) {
  return <section className="page-frame"><header className="page-title"><span className="kicker">NOTES & ESSAYS</span><h1>随笔</h1><p>记录判断、片段，以及那些值得慢慢展开的事情。</p></header><div className="essay-index-list large">{essays.map((essay, index) => <Link key={essay.id} to={`/essays/${essay.slug}`} onNavigate={navigate}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{essay.category} · {essay.date}</small><h2>{essay.title}</h2><p>{essay.excerpt}</p><em>{essay.tags.join(' · ')}</em></div><ArrowRight size={19} /></Link>)}</div></section>
}

function EssayDetail({ essay, navigate }: { essay: PublicEssay; navigate: (path: string) => void }) {
  return <article className="reading-page"><Link to="/essays" className="back-link" onNavigate={navigate}><ArrowLeft size={15} /> 返回随笔</Link><header><span className="kicker">{essay.category} · {essay.date}</span><h1>{essay.title}</h1><p>{essay.excerpt}</p></header><div className="prose">{essay.content.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><footer>{essay.tags.map((tag) => <span key={tag}>{tag}</span>)}</footer></article>
}

function Creation({ novels, navigate }: { novels: PublicNovel[]; navigate: (path: string) => void }) {
  return <section className="page-frame creation-index"><header className="page-title"><span className="kicker">FICTION ARCHIVE</span><h1>创作</h1><p>故事、人物与世界在这里彼此照亮，但各自保持清晰边界。</p></header>{novels.map((novel, index) => <Link className="novel-public-row" key={novel.id} to={`/fiction/${novel.slug}`} onNavigate={navigate}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{novel.status} · {novel.wordCount.toLocaleString()} 字</small><h2>{novel.title}</h2><p>{novel.subtitle}</p></div><ArrowRight size={20} /></Link>)}</section>
}

function Fiction({ novel, navigate }: { novel: PublicNovel; navigate: (path: string) => void }) {
  return <><section className="fiction-hero"><span className="kicker">CACTUS FICTION · {novel.status}</span><h1>{novel.title}</h1><p className="fiction-subtitle">{novel.subtitle}</p><p>{novel.synopsis}</p><div><span>{novel.wordCount.toLocaleString()} 字</span><span>{novel.characters.length} 位角色</span><span>{novel.chapters.length} 个公开章节</span></div></section><section className="public-section fiction-reference"><div><span className="kicker">WORLD NOTES</span><h2>设定摘录</h2>{novel.settings.map((item) => <article key={item.id}><small>{item.category}</small><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div><div><span className="kicker">CHARACTERS</span><h2>人物</h2>{novel.characters.map((item) => <article key={item.id}><span className="public-character-mark" style={{ '--character-color': item.color } as React.CSSProperties}>{item.name.slice(0, 1)}</span><div><small>{item.role}</small><h3>{item.name}</h3><p>{item.motivation}</p></div></article>)}</div></section><section className="public-section"><header><span className="kicker">CHAPTERS</span><h2>章节</h2></header><div className="essay-index-list">{novel.chapters.map((chapter, index) => <Link key={chapter.id} to={`/fiction/${novel.slug}/chapters/${chapter.slug}`} onNavigate={navigate}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{chapter.title}</h3><p>{chapter.excerpt || '章节正文已完成。'}</p></div><ArrowRight size={18} /></Link>)}</div></section></>
}

function ChapterDetail({ novel, chapterSlug, navigate }: { novel: PublicNovel; chapterSlug: string; navigate: (path: string) => void }) {
  const chapter = novel.chapters.find((item) => item.slug === chapterSlug)
  if (!chapter) return <NotFound navigate={navigate} />
  return <article className="reading-page chapter-reading"><Link to={`/fiction/${novel.slug}`} className="back-link" onNavigate={navigate}><ArrowLeft size={15} /> 返回《{novel.title}》</Link><header><span className="kicker">CACTUS FICTION</span><h1>{chapter.title}</h1><p>{novel.title}</p></header><div className="prose">{chapter.content.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></article>
}

function PublicPersonaGallery({ items }: { items: PublicMedia[] }) {
  const [kind, setKind] = useState<'all' | 'image' | 'video'>('all')
  const [tag, setTag] = useState('all')
  const [visibleCount, setVisibleCount] = useState(12)
  const [activeId, setActiveId] = useState<string | null>(null)
  const tags = Array.from(new Set(items.flatMap((item) => item.tags ?? [])))
  const filtered = items.filter((item) => (kind === 'all' || item.type === kind) && (tag === 'all' || item.tags?.includes(tag)))
  const activeIndex = activeId ? filtered.findIndex((item) => item.id === activeId) : -1
  const active = activeIndex >= 0 ? filtered[activeIndex] : null

  useEffect(() => setVisibleCount(12), [kind, tag])
  useEffect(() => {
    if (!active) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveId(null)
      if (event.key === 'ArrowLeft' && filtered.length > 1) setActiveId(filtered[(activeIndex - 1 + filtered.length) % filtered.length].id)
      if (event.key === 'ArrowRight' && filtered.length > 1) setActiveId(filtered[(activeIndex + 1) % filtered.length].id)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active, activeIndex, filtered])

  function moveActive(direction: -1 | 1) {
    if (activeIndex < 0 || filtered.length < 2) return
    setActiveId(filtered[(activeIndex + direction + filtered.length) % filtered.length].id)
  }

  if (items.length === 0) return null
  return <section className="public-persona-gallery"><header><div><span className="kicker">KIRO VISUAL ARCHIVE</span><h2>祁珞影像档案</h2><p>她在不同光线、场景与故事切片里的样子。</p></div><div className="public-gallery-filters"><div>{(['all', 'image', 'video'] as const).map((value) => <button key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}>{value === 'all' ? '全部' : value === 'image' ? '图片' : '视频'}</button>)}</div>{tags.length > 0 && <select aria-label="按标签筛选祁珞公开影像" value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">全部标签</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select>}</div></header>
    <div className="public-gallery-wall">{filtered.slice(0, visibleCount).map((item) => <article key={item.id}><div>{item.type === 'video' ? <video src={asset(item.url)} controls preload="metadata" /> : <img src={asset(item.url)} alt={item.title} loading="lazy" />}<span>{item.type === 'video' ? <Play size={13} /> : <ImageIcon size={13} />}{item.type === 'video' ? '视频' : '图片'}</span><button aria-label={`放大预览${item.title}`} onClick={() => setActiveId(item.id)}><Maximize2 size={15} /></button></div><footer><strong>{item.title}</strong>{item.caption && <p>{item.caption}</p>}{item.tags?.length > 0 && <small>{item.tags.join(' · ')}</small>}</footer></article>)}</div>
    {visibleCount < filtered.length && <button className="public-gallery-more" onClick={() => setVisibleCount((count) => count + 12)}>加载更多 · 还有 {filtered.length - visibleCount} 件</button>}
    {active && <div className="public-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${active.title}预览`} onMouseDown={() => setActiveId(null)}><section onMouseDown={(event) => event.stopPropagation()}><header><div><span>KIRO VISUAL ARCHIVE · {String(activeIndex + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}</span><strong>{active.title}</strong></div><button aria-label="关闭影像预览" onClick={() => setActiveId(null)}><X size={20} /></button></header><div className="public-gallery-lightbox-media">{active.type === 'video' ? <video src={asset(active.url)} controls autoPlay /> : <img src={asset(active.url)} alt={active.title} />}</div><footer><p>{active.caption}</p>{active.tags?.length > 0 && <span>{active.tags.join(' · ')}</span>}</footer>{filtered.length > 1 && <><button className="public-gallery-previous" aria-label="上一件影像" onClick={() => moveActive(-1)}><ChevronLeft size={24} /></button><button className="public-gallery-next" aria-label="下一件影像" onClick={() => moveActive(1)}><ChevronRight size={24} /></button></>}</section></div>}
  </section>
}

function About({ gallery }: { gallery: PublicMedia[] }) {
  return <section className="about-page"><header><span className="kicker">VIRTUAL PERSONA · KK</span><h1>祁珞 <i>/ Kiro</i></h1><p>于风沙之中立身，于荒芜之地守心。<br />纵使身处旷野，亦不熄灭心中的光。</p></header><div className="about-editorial"><figure><img src={asset('media/kk/portrait-960.webp?v=1.1')} alt="虚拟人物祁珞的全身档案形象" /><figcaption>GENERATED VISUAL ASSET · KK</figcaption></figure><div><span className="kicker">THE PERSONA</span><h2>带刺，但不失温热。</h2><p>祁珞生长在祁连山北麓的河西戈壁。那里风沙漫长，昼夜分明。环境教会她自持与边界，如同仙人掌生出尖刺，不是为了主动攻击，只是用来抵御外界的侵扰。</p><p>她不热衷于喧闹，也不习惯刻意逢迎。现实的风沙可以磨蚀环境，却磨不掉一个人内心的热忱与清醒。</p><dl><div><dt>品牌</dt><dd>Cactus / 掌仙人</dd></div><div><dt>代号</dt><dd>KK / 卡卡</dd></div><div><dt>信念</dt><dd>Keep Keen</dd></div></dl></div></div><PublicPersonaGallery items={gallery} /></section>
}

function NotFound({ navigate }: { navigate: (path: string) => void }) { return <section className="not-found"><span className="kicker">404 · LOST IN THE ARCHIVE</span><h1>这一页还没有长出来。</h1><Link to="/" onNavigate={navigate}>返回首页 <ArrowRight size={15} /></Link></section> }

export function PublicSite({ snapshot }: { snapshot: PublicSnapshot }) {
  const [path, setPath] = useState(currentPath)
  useEffect(() => { const listener = () => setPath(currentPath()); window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener) }, [])
  function navigate(next: string) { window.history.pushState({}, '', `${base}${next}`); setPath(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  let page: ReactNode
  const essayMatch = path.match(/^\/essays\/([^/]+)$/)
  const fictionMatch = path.match(/^\/fiction\/([^/]+)$/)
  const chapterMatch = path.match(/^\/fiction\/([^/]+)\/chapters\/([^/]+)$/)
  if (path === '/') page = <Home snapshot={snapshot} navigate={navigate} />
  else if (path === '/essays') page = <Essays essays={snapshot.essays} navigate={navigate} />
  else if (essayMatch) { const essay = snapshot.essays.find((item) => item.slug === essayMatch[1]); page = essay ? <EssayDetail essay={essay} navigate={navigate} /> : <NotFound navigate={navigate} /> }
  else if (path === '/creation') page = <Creation novels={snapshot.novels} navigate={navigate} />
  else if (chapterMatch) { const novel = snapshot.novels.find((item) => item.slug === chapterMatch[1]); page = novel ? <ChapterDetail novel={novel} chapterSlug={chapterMatch[2]} navigate={navigate} /> : <NotFound navigate={navigate} /> }
  else if (fictionMatch) { const novel = snapshot.novels.find((item) => item.slug === fictionMatch[1]); page = novel ? <Fiction novel={novel} navigate={navigate} /> : <NotFound navigate={navigate} /> }
  else if (path === '/about') page = <About gallery={snapshot.gallery ?? []} />
  else page = <NotFound navigate={navigate} />
  return <Shell path={path} navigate={navigate}>{page}</Shell>
}
