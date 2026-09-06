import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Header } from './components/Header'
import { Sidebar, type ViewKey } from './components/Sidebar'
import type { CloudSyncController } from './cloud/useCloudSync'
import { downloadPublicSnapshot } from './publicSnapshot'
import type { NovelProject } from './types'
import { CharactersView } from './views/CharactersView'
import { ChaptersView } from './views/ChaptersView'
import { CreationHome } from './views/CreationHome'
import { EssaysView } from './views/EssaysView'
import { GraphView } from './views/GraphView'
import { HomeView } from './views/HomeView'
import { AboutView } from './views/AboutView'
import { NovelsView } from './views/NovelsView'
import { OverviewView } from './views/OverviewView'
import { PublishView } from './views/PublishView'
import { PublicPreview } from './views/PublicPreview'
import { SettingsView } from './views/SettingsView'

const viewMeta: Record<ViewKey, { title: string; description: string }> = {
  home: { title: '个人总览', description: '祁珞的公开内容、私密创作与最近活动。' },
  essays: { title: '随笔', description: '写下片段、判断和那些值得慢慢展开的事。' },
  creation: { title: '创作空间', description: '独立管理设定、角色、关系与小说，在需要时建立引用。' },
  novels: { title: '小说', description: '管理作品概览、关联资料与章节。' },
  novel: { title: '小说概览', description: '查看作品进度以及关联的设定、角色和关系。' },
  settings: { title: '设定集', description: '让世界的规则彼此咬合，也允许它保留一点谜。' },
  characters: { title: '角色档案', description: '记录一个人的欲望、矛盾，以及他不愿被读者知道的事。' },
  graph: { title: '角色关系图', description: '用关系而不是名单，观察故事真正的张力。' },
  chapters: { title: '章节编辑', description: '专注正文，并在侧边保留作品上下文。' },
  about: { title: '关于', description: '祁珞、KK 与 Cactus 的身份档案。' },
  publish: { title: '发布中心', description: '检查公开边界，预览读者最终看见的内容。' },
}

interface StudioWorkspaceProps {
  project: NovelProject
  setProject: Dispatch<SetStateAction<NovelProject>>
  cloud: CloudSyncController
}

export function StudioWorkspace({ project, setProject, cloud }: StudioWorkspaceProps) {
  const [view, setView] = useState<ViewKey>('home')
  const [previewing, setPreviewing] = useState(false)
  const [selectedNovelId, setSelectedNovelId] = useState(project.novels?.[0]?.id)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const [graphNovelId, setGraphNovelId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedNovelId && project.novels?.some((novel) => novel.id === selectedNovelId)) return
    setSelectedNovelId(project.novels?.[0]?.id)
  }, [project.novels, selectedNovelId])

  function navigate(nextView: ViewKey) {
    setView(nextView)
    if (nextView !== 'graph') setSelectedCharacterId(null)
    if (nextView === 'graph') setGraphNovelId(null)
  }

  if (previewing) return <PublicPreview project={project} onClose={() => setPreviewing(false)} />

  return <div className="app-shell">
    <Sidebar active={view} onChange={navigate} onPreview={() => setPreviewing(true)} />
    <div className="workspace">
      <Header {...viewMeta[view]} cloud={cloud} />
      <main className="workspace-main">
        {view === 'home' && <HomeView project={project} onNavigate={navigate} />}
        {view === 'essays' && <EssaysView project={project} onChange={setProject} />}
        {view === 'creation' && <CreationHome project={project} onNavigate={navigate} />}
        {view === 'novels' && <NovelsView project={project} onChange={setProject} onOpen={(id) => { setSelectedNovelId(id); setView('novel') }} />}
        {view === 'novel' && <OverviewView project={project} novelId={selectedNovelId} onChange={setProject} onNavigate={navigate} onBack={() => setView('novels')} onOpenGraph={() => { setGraphNovelId(selectedNovelId ?? null); setView('graph') }} />}
        {view === 'settings' && <SettingsView project={project} onChange={setProject} />}
        {view === 'characters' && <CharactersView project={project} onChange={setProject} initialCharacterId={selectedCharacterId} onOpenGraph={(id) => { setSelectedCharacterId(id); setGraphNovelId(null); setView('graph') }} />}
        {view === 'graph' && <GraphView project={project} onChange={setProject} initialCharacterId={selectedCharacterId} initialNovelId={graphNovelId} onOpenCharacter={(id) => { setSelectedCharacterId(id); setView('characters') }} />}
        {view === 'chapters' && <ChaptersView project={project} novelId={selectedNovelId} onChange={setProject} onBack={() => setView('novel')} />}
        {view === 'about' && <AboutView project={project} />}
        {view === 'publish' && <PublishView project={project} onPreview={() => setPreviewing(true)} onExport={() => downloadPublicSnapshot(project)} />}
      </main>
    </div>
  </div>
}
