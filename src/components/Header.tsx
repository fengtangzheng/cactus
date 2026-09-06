import { Cloud, Command, Search } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

interface HeaderProps {
  title: string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="top-actions">
        <button className="search-trigger"><Search size={15} /> 搜索 <span><Command size={11} /> K</span></button>
        <span className="save-state"><Cloud size={15} /> 已保存到本地</span>
        <ThemeSwitcher storageKey="cactus-studio-theme" />
      </div>
    </header>
  )
}
