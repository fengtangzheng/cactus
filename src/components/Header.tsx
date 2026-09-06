import { Command, Search } from 'lucide-react'
import type { CloudSyncController } from '../cloud/useCloudSync'
import { CloudSyncControl } from './CloudSyncControl'
import { ThemeSwitcher } from './ThemeSwitcher'

interface HeaderProps {
  title: string
  description: string
  cloud: CloudSyncController
}

export function Header({ title, description, cloud }: HeaderProps) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="top-actions">
        <button className="search-trigger"><Search size={15} /> 搜索 <span><Command size={11} /> K</span></button>
        <CloudSyncControl cloud={cloud} />
        <ThemeSwitcher storageKey="cactus-studio-theme" />
      </div>
    </header>
  )
}
