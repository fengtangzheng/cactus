import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, Play, X } from 'lucide-react'
import type { MediaAsset } from '../types'
import { MediaAssetMedia } from './MediaAssetMedia'

type MediaKind = 'all' | 'image' | 'video'
const INITIAL_VISIBLE = 12

export function PersonaGallery({ assets }: { assets: MediaAsset[] }) {
  const [kind, setKind] = useState<MediaKind>('all')
  const [tag, setTag] = useState('all')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [activeId, setActiveId] = useState<string | null>(null)
  const ordered = useMemo(() => [...assets].sort((a, b) => a.sortOrder - b.sortOrder), [assets])
  const tags = useMemo(() => Array.from(new Set(ordered.flatMap((item) => item.tags))), [ordered])
  const filtered = ordered.filter((item) => (kind === 'all' || item.type === kind) && (tag === 'all' || item.tags.includes(tag)))
  const visible = filtered.slice(0, visibleCount)
  const activeIndex = activeId ? filtered.findIndex((item) => item.id === activeId) : -1
  const active = activeIndex >= 0 ? filtered[activeIndex] : null

  useEffect(() => setVisibleCount(INITIAL_VISIBLE), [kind, tag])

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

  return (
    <section className="persona-gallery-section">
      <header className="persona-gallery-header">
        <div><span className="eyebrow">KIRO VISUAL ARCHIVE</span><h2>祁珞影像档案</h2><p>只属于祁珞的视觉记录，共 {assets.length} 件素材。</p></div>
        <div className="persona-gallery-filters">
          <div>{(['all', 'image', 'video'] as const).map((value) => <button key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}>{value === 'all' ? '全部' : value === 'image' ? '图片' : '视频'}</button>)}</div>
          {tags.length > 0 && <select aria-label="按标签筛选祁珞影像" value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">全部标签</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select>}
        </div>
      </header>
      {visible.length > 0 ? <div className="persona-gallery-wall">
        {visible.map((asset) => <article className="persona-gallery-card" key={asset.id}>
          <div className="persona-gallery-media"><MediaAssetMedia asset={asset} /><span>{asset.type === 'video' ? <Play size={13} /> : <ImageIcon size={13} />}{asset.type === 'video' ? '视频' : '图片'}</span><button aria-label={`放大预览${asset.title}`} onClick={() => setActiveId(asset.id)}><Maximize2 size={15} /></button></div>
          <footer><div><strong>{asset.title}</strong>{asset.caption && <p>{asset.caption}</p>}</div><span className={asset.visibility}>{asset.visibility === 'public' ? '可公开' : '仅本地'}</span>{asset.tags.length > 0 && <small>{asset.tags.join(' · ')}</small>}</footer>
        </article>)}
      </div> : <div className="persona-gallery-empty"><ImageIcon size={24} /><strong>这个筛选下还没有影像</strong><span>素材仍然在角色档案里管理。</span></div>}
      {visibleCount < filtered.length && <button className="persona-gallery-more" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}>加载更多 · 还有 {filtered.length - visibleCount} 件</button>}
      {active && <div className="persona-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${active.title}预览`} onMouseDown={() => setActiveId(null)}>
        <section onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span>KIRO VISUAL ARCHIVE · {String(activeIndex + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}</span><strong>{active.title}</strong></div><button aria-label="关闭影像预览" onClick={() => setActiveId(null)}><X size={20} /></button></header>
          <div className="persona-gallery-lightbox-media"><MediaAssetMedia asset={active} /></div>
          <footer><p>{active.caption || '祁珞的视觉档案。'}</p>{active.tags.length > 0 && <span>{active.tags.join(' · ')}</span>}</footer>
          {filtered.length > 1 && <><button className="persona-gallery-previous" aria-label="上一件影像" onClick={() => moveActive(-1)}><ChevronLeft size={24} /></button><button className="persona-gallery-next" aria-label="下一件影像" onClick={() => moveActive(1)}><ChevronRight size={24} /></button></>}
        </section>
      </div>}
    </section>
  )
}
