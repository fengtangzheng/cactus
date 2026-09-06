import {
  Archive,
  BookOpenText,
  Boxes,
  ChartNoAxesCombined,
  Eye,
  GitFork,
  Info,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  UsersRound,
} from 'lucide-react'

export type ViewKey = 'home' | 'essays' | 'creation' | 'novels' | 'novel' | 'settings' | 'characters' | 'graph' | 'chapters' | 'about' | 'publish'

interface SidebarProps {
  active: ViewKey
  onChange: (view: ViewKey) => void
  onPreview: () => void
}

const personalItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'home', label: '个人总览', icon: LayoutDashboard },
  { key: 'essays', label: '随笔', icon: NotebookPen },
]

const creationItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'creation', label: '创作总览', icon: Archive },
  { key: 'settings', label: '设定集', icon: Boxes },
  { key: 'characters', label: '角色档案', icon: UsersRound },
  { key: 'graph', label: '角色关系图', icon: GitFork },
  { key: 'novels', label: '小说', icon: BookOpenText },
]

export function Sidebar({ active, onChange, onPreview }: SidebarProps) {
  const isActive = (key: ViewKey) => key === 'novels' ? ['novels', 'novel', 'chapters'].includes(active) : active === key
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onChange('home')}>
        <span className="brand-mark"><BookOpenText size={19} strokeWidth={1.8} /></span>
        <span>
          <strong>Cactus</strong>
          <small>Keep Keen Studio</small>
        </span>
      </button>

      <div className="project-chip">
        <span className="project-glyph">KK</span>
        <span>
          <small>个人空间</small>
          <strong>祁珞的空间</strong>
        </span>
        <Settings2 size={15} />
      </div>

      <nav className="nav-list" aria-label="个人工作台导航">
        <p className="nav-caption">个人内容</p>
        {personalItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={isActive(item.key) ? 'nav-item active' : 'nav-item'}
              onClick={() => onChange(item.key)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
        <p className="nav-caption separated">创作空间</p>
        {creationItems.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.key} className={isActive(item.key) ? 'nav-item active' : 'nav-item'} onClick={() => onChange(item.key)}>
              <Icon size={17} />{item.label}
            </button>
          )
        })}
        <p className="nav-caption separated">身份</p>
        <button className={active === 'about' ? 'nav-item active' : 'nav-item'} onClick={() => onChange('about')}>
          <Info size={17} />关于祁珞
        </button>
        <p className="nav-caption separated">发布</p>
        <button
          className={active === 'publish' ? 'nav-item active' : 'nav-item'}
          onClick={() => onChange('publish')}
        >
          <ChartNoAxesCombined size={17} />
          发布中心
        </button>
      </nav>

      <div className="privacy-note">
        <span className="privacy-dot" />
        <span><strong>本地草稿</strong><small>尚未连接云端</small></span>
      </div>
      <button className="preview-button" onClick={onPreview}>
        <Eye size={16} /> 预览公开主页
      </button>
    </aside>
  )
}
