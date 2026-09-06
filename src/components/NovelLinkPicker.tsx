import { BookOpenText, Link2 } from 'lucide-react'
import { getResourceScope } from '../resourceLinks'
import type { Novel } from '../types'

interface NovelLinkPickerProps {
  novels: Novel[]
  value: string[]
  onChange: (novelIds: string[]) => void
}

const scopeLabels = {
  independent: '独立资料',
  exclusive: '小说专属',
  shared: '多作品共享',
}

export function NovelLinkPicker({ novels, value, onChange }: NovelLinkPickerProps) {
  const selected = new Set(value)
  const scope = getResourceScope(value)

  function toggle(novelId: string) {
    onChange(selected.has(novelId) ? value.filter((id) => id !== novelId) : [...value, novelId])
  }

  return <section className="novel-link-picker">
    <header><div><span className="eyebrow">作品归属</span><strong>{scopeLabels[scope]}</strong></div><span><Link2 size={13} /> {value.length} 部小说</span></header>
    <div className="novel-link-options">{novels.map((novel) => <label key={novel.id} className={selected.has(novel.id) ? 'selected' : ''}>
      <input type="checkbox" checked={selected.has(novel.id)} onChange={() => toggle(novel.id)} />
      <BookOpenText size={15} /><span><strong>{novel.title}</strong><small>{novel.chapterIds.length} 个章节</small></span>
    </label>)}</div>
    {novels.length === 0 && <p>还没有小说，当前资料将作为独立灵感保存。</p>}
    <small>不选择小说时保留为独立资料且首期不会进入公开站；选择多部小说时自动标记为共享。</small>
  </section>
}
