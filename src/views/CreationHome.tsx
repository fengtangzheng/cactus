import { ArrowRight, BookOpenText, Boxes, GitFork, UsersRound } from 'lucide-react'
import type { ViewKey } from '../components/Sidebar'
import type { NovelProject } from '../types'

export function CreationHome({ project, onNavigate }: { project: NovelProject; onNavigate: (view: ViewKey) => void }) {
  const modules = [
    { view: 'settings' as const, index: '01', title: '设定集', description: '世界、地点、组织、规则与关键物件。', count: `${project.settings.length} 条`, icon: Boxes },
    { view: 'characters' as const, index: '02', title: '角色档案', description: '人物动机、秘密与图片 / 视频素材。', count: `${project.characters.length} 人`, icon: UsersRound },
    { view: 'graph' as const, index: '03', title: '角色关系图', description: '引用角色档案，观察故事张力与变化。', count: `${project.relationships.length} 条关系`, icon: GitFork },
    { view: 'novels' as const, index: '04', title: '小说', description: '从作品概览进入章节写作，并弱关联其他资料。', count: `${project.novels?.length ?? 0} 部`, icon: BookOpenText },
  ]
  return <div className="view-stack">
    <section className="creation-intro"><span className="eyebrow">CACTUS ARCHIVE · CREATION</span><h2>故事从碎片之间生长。</h2><p>每类资料拥有独立入口；需要时，它们通过明确引用形成一部作品，而不是被锁进同一个编辑器。</p></section>
    <section className="creation-module-grid">{modules.map(({ view, index, title, description, count, icon: Icon }) => <button key={view} onClick={() => onNavigate(view)}><span className="creation-module-index">{index}</span><Icon size={24} /><div><h3>{title}</h3><p>{description}</p></div><footer><span>{count}</span><ArrowRight size={17} /></footer></button>)}</section>
  </div>
}
