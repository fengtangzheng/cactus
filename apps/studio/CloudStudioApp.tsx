import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { CloudStudioGate } from '../../src/components/CloudSyncControl'
import { useCloudSync } from '../../src/cloud/useCloudSync'
import { StudioWorkspace } from '../../src/StudioWorkspace'
import type { NovelProject } from '../../src/types'
import { normalizeProject } from '../../src/useProject'

const CACHE_KEY = 'cactus-cloud-studio-v1'
const emptyProject: NovelProject = {
  dataVersion: 7,
  title: '未命名项目',
  subtitle: '',
  penName: '祁珞',
  synopsis: '',
  essays: [],
  settings: [],
  characters: [],
  relationships: [],
  chapters: [],
  novels: [],
  media: [],
}

export function CloudStudioApp() {
  const hadLocalData = useRef(Boolean(window.localStorage.getItem(CACHE_KEY)))
  const [project, setStoredProject] = useState<NovelProject>(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY)
      return cached ? normalizeProject(JSON.parse(cached) as NovelProject) : emptyProject
    } catch {
      return emptyProject
    }
  })
  const setProject = useCallback<Dispatch<SetStateAction<NovelProject>>>((action) => {
    setStoredProject((current) => normalizeProject(typeof action === 'function' ? action(current) : action))
  }, [])
  const cloud = useCloudSync({ project, setProject, hasLocalData: hadLocalData.current, cacheKey: CACHE_KEY, createWhenMissing: false })

  useEffect(() => {
    if (cloud.ready) window.localStorage.setItem(CACHE_KEY, JSON.stringify(project))
  }, [cloud.ready, project])

  return <CloudStudioGate cloud={cloud}><StudioWorkspace project={project} setProject={setProject} cloud={cloud} /></CloudStudioGate>
}
