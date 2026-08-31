import { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar, type ViewKey } from './components/Sidebar'
import { downloadPublicSnapshot } from './publicSnapshot'
import { useProject } from './useProject'
import { CharactersView } from './views/CharactersView'
import { ChaptersView } from './views/ChaptersView'
import { GraphView } from './views/GraphView'
import { HomeView } from './views/HomeView'
import { OverviewView } from './views/OverviewView'
import { LearningView, NotesView, ProjectsView } from './views/PersonalContentView'
import { PublishView } from './views/PublishView'
import { PublicPreview } from './views/PublicPreview'
import { SettingsView } from './views/SettingsView'

const viewMeta: Record<ViewKey, { title: string; description: string }> = {
  home: { title: '个人总览', description: '把记录、学习、项目和创作放在一个持续生长的空间里。' },
  notes: { title: '记录', description: '捕捉生活、工作和思考中值得留下来的片段。' },
  learning: { title: '学习', description: '把输入整理成路径，把结论变成以后还能使用的东西。' },
  projects: { title: '项目', description: '记录正在推进的作品、产品和长期实验。' },
  fiction: { title: '小说创作', description: '《雾都来信》的正文、人物与世界设定。' },
  settings: { title: '设定集', description: '让世界的规则彼此咬合，也允许它保留一点谜。' },
  characters: { title: '角色档案', description: '记录一个人的欲望、矛盾，以及他不愿被读者知道的事。' },
  graph: { title: '角色关系图', description: '用关系而不是名单，观察故事真正的张力。' },
  chapters: { title: '章节', description: '组织正文、场景与修订状态。' },
  publish: { title: '发布中心', description: '检查公开边界，预览读者最终看见的内容。' },
}

export function App() {
  const { project, setProject } = useProject()
  const [view, setView] = useState<ViewKey>('home')
  const [previewing, setPreviewing] = useState(false)

  if (previewing) return <PublicPreview project={project} onClose={() => setPreviewing(false)} />

  return (
    <div className="app-shell">
      <Sidebar active={view} onChange={setView} onPreview={() => setPreviewing(true)} />
      <div className="workspace">
        <Header {...viewMeta[view]} />
        <main className="workspace-main">
          {view === 'home' && <HomeView project={project} onNavigate={setView} />}
          {view === 'notes' && <NotesView />}
          {view === 'learning' && <LearningView />}
          {view === 'projects' && <ProjectsView />}
          {view === 'fiction' && <OverviewView project={project} onNavigate={setView} />}
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
