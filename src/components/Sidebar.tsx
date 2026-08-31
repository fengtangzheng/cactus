import {
  BookOpenText,
  Boxes,
  ChartNoAxesCombined,
  Eye,
  FilePenLine,
  FolderKanban,
  GitFork,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  UsersRound,
} from 'lucide-react'

export type ViewKey = 'home' | 'notes' | 'learning' | 'projects' | 'fiction' | 'settings' | 'characters' | 'graph' | 'chapters' | 'publish'

interface SidebarProps {
  active: ViewKey
  onChange: (view: ViewKey) => void
  onPreview: () => void
}

const personalItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'home', label: '个人总览', icon: LayoutDashboard },
  { key: 'notes', label: '记录', icon: NotebookPen },
  { key: 'learning', label: '学习', icon: GraduationCap },
  { key: 'projects', label: '项目', icon: FolderKanban },
]

const fictionItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'fiction', label: '小说概览', icon: BookOpenText },
  { key: 'settings', label: '设定集', icon: Boxes },
  { key: 'characters', label: '角色档案', icon: UsersRound },
  { key: 'graph', label: '角色关系图', icon: GitFork },
  { key: 'chapters', label: '章节', icon: FilePenLine },
]

export function Sidebar({ active, onChange, onPreview }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onChange('home')}>
        <span className="brand-mark"><BookOpenText size={19} strokeWidth={1.8} /></span>
        <span>
          <strong>Cactus</strong>
          <small>Personal Studio</small>
        </span>
      </button>

      <div className="project-chip">
        <span className="project-glyph">冯</span>
        <span>
          <small>个人空间</small>
          <strong>冯唐正的主页</strong>
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
              className={active === item.key ? 'nav-item active' : 'nav-item'}
              onClick={() => onChange(item.key)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
        <p className="nav-caption separated">创作空间</p>
        {fictionItems.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.key} className={active === item.key ? 'nav-item active' : 'nav-item'} onClick={() => onChange(item.key)}>
              <Icon size={17} />{item.label}
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
