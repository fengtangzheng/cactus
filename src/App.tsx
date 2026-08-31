import { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar, type ViewKey } from './components/Sidebar'
import { downloadPublicSnapshot } from './publicSnapshot'
import { useProject } from './useProject'
import { CharactersView } from './views/CharactersView'
import { ChaptersView } from './views/ChaptersView'
import { GraphView } from './views/GraphView'
import { OverviewView } from './views/OverviewView'
import { PublishView } from './views/PublishView'
import { PublicPreview } from './views/PublicPreview'
import { SettingsView } from './views/SettingsView'

const viewMeta: Record<ViewKey, { title: string; description: string }> = {
  overview: { title: '创作概览', description: '下午好。今天也从故事最想去的地方开始。' },
  settings: { title: '设定集', description: '让世界的规则彼此咬合，也允许它保留一点谜。' },
  characters: { title: '角色档案', description: '记录一个人的欲望、矛盾，以及他不愿被读者知道的事。' },
  graph: { title: '角色关系图', description: '用关系而不是名单，观察故事真正的张力。' },
  chapters: { title: '章节', description: '组织正文、场景与修订状态。' },
  publish: { title: '发布中心', description: '检查公开边界，预览读者最终看见的内容。' },
}

export function App() {
  const { project, setProject } = useProject()
  const [view, setView] = useState<ViewKey>('overview')
  const [previewing, setPreviewing] = useState(false)

  if (previewing) return <PublicPreview project={project} onClose={() => setPreviewing(false)} />

  return (
    <div className="app-shell">
      <Sidebar active={view} onChange={setView} onPreview={() => setPreviewing(true)} />
      <div className="workspace">
        <Header {...viewMeta[view]} />
        <main className="workspace-main">
          {view === 'overview' && <OverviewView project={project} onNavigate={setView} />}
          {view === 'settings' && <SettingsView project={project} onChange={setProject} />}
          {view === 'characters' && <CharactersView project={project} onChange={setProject} />}
          {view === 'graph' && <GraphView project={project} onChange={setProject} />}
          {view === 'chapters' && <ChaptersView project={project} />}
          {view === 'publish' && <PublishView project={project} onPreview={() => setPreviewing(true)} onExport={() => downloadPublicSnapshot(project)} />}
        </main>
      </div>
    </div>
  )
}
