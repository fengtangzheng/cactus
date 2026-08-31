import { useCallback, useEffect, useState } from 'react'
import { seedProject } from './data'
import type { NovelProject } from './types'

const STORAGE_KEY = 'cactus-novel-project-v1'

export function useProject() {
  const [project, setProject] = useState<NovelProject>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      return saved ? (JSON.parse(saved) as NovelProject) : seedProject
    } catch {
      return seedProject
    }
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const resetProject = useCallback(() => {
    setProject(seedProject)
  }, [])

  return { project, setProject, resetProject }
}
