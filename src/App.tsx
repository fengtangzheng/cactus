import { StudioWorkspace } from './StudioWorkspace'
import { useCloudSync } from './cloud/useCloudSync'
import { PROJECT_STORAGE_KEY, useProject } from './useProject'

export function App() {
  const { project, setProject, hasLocalData } = useProject()
  const cloud = useCloudSync({ project, setProject, hasLocalData, cacheKey: PROJECT_STORAGE_KEY })
  return <StudioWorkspace project={project} setProject={setProject} cloud={cloud} />
}
