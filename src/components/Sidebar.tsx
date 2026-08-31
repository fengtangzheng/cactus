import {
  BookOpenText,
  Boxes,
  ChartNoAxesCombined,
  Eye,
  FilePenLine,
  GitFork,
  LayoutDashboard,
  Settings2,
  UsersRound,
} from 'lucide-react'

export type ViewKey = 'overview' | 'settings' | 'characters' | 'graph' | 'chapters' | 'publish'

interface SidebarProps {
  active: ViewKey
  onChange: (view: ViewKey) => void
  onPreview: () => void
}

const primaryItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'overview', label: '创作概览', icon: LayoutDashboard },
  { key: 'settings', label: '设定集', icon: Boxes },
  { key: 'characters', label: '角色档案', icon: UsersRound },
  { key: 'graph', label: '角色关系图', icon: GitFork },
  { key: 'chapters', label: '章节', icon: FilePenLine },
]

export function Sidebar({ active, onChange, onPreview }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onChange('overview')}>
        <span className="brand-mark"><BookOpenText size={19} strokeWidth={1.8} /></span>
        <span>
          <strong>Cactus</strong>
          <small>Novel Studio</small>
        </span>
      </button>

      <div className="project-chip">
        <span className="project-glyph">雾</span>
        <span>
          <small>当前作品</small>
          <strong>雾都来信</strong>
        </span>
        <Settings2 size={15} />
      </div>

      <nav className="nav-list" aria-label="创作区导航">
        <p className="nav-caption">创作空间</p>
        {primaryItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.key}
              className={active === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => onChange(item.key)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
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
