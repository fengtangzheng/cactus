import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { User } from '@supabase/supabase-js'
import type { NovelProject } from '../types'
import { uploadPendingMedia } from './mediaRepository'
import { createCloudProject, loadCloudProject, saveCloudProject, type CloudProjectRecord } from './projectRepository'
import { cloudConfigured, cloudRedirectUrl, supabase } from './supabaseClient'

export type CloudSyncStatus = 'disabled' | 'signed-out' | 'link-sent' | 'loading' | 'saving' | 'synced' | 'conflict' | 'error'

interface SyncConflict {
  local: NovelProject
  remote: NovelProject
  remoteRecord: CloudProjectRecord
}

interface SyncMetadata {
  projectId: string
  version: number
  snapshot: string
}

export interface CloudSyncController {
  configured: boolean
  ready: boolean
  status: CloudSyncStatus
  userEmail?: string
  lastSyncedAt?: string
  error?: string
  hasConflict: boolean
  signInWithEmail: (email: string) => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
  keepLocalVersion: () => Promise<void>
  useCloudVersion: () => void
}

interface UseCloudSyncOptions {
  project: NovelProject
  setProject: Dispatch<SetStateAction<NovelProject>>
  hasLocalData: boolean
  cacheKey: string
  createWhenMissing?: boolean
}

function serialize(project: NovelProject) {
  return JSON.stringify(project)
}

function metadataKey(cacheKey: string, userId: string) {
  return `${cacheKey}:cloud:${userId}`
}

function readMetadata(cacheKey: string, userId: string): SyncMetadata | null {
  try {
    const value = window.localStorage.getItem(metadataKey(cacheKey, userId))
    return value ? JSON.parse(value) as SyncMetadata : null
  } catch {
    return null
  }
}

function writeMetadata(cacheKey: string, userId: string, record: Pick<CloudProjectRecord, 'id' | 'version'>, project: NovelProject) {
  const metadata: SyncMetadata = { projectId: record.id, version: record.version, snapshot: serialize(project) }
  window.localStorage.setItem(metadataKey(cacheKey, userId), JSON.stringify(metadata))
}

export function useCloudSync({ project, setProject, hasLocalData, cacheKey, createWhenMissing = true }: UseCloudSyncOptions): CloudSyncController {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<CloudSyncStatus>(cloudConfigured ? 'loading' : 'disabled')
  const [lastSyncedAt, setLastSyncedAt] = useState<string>()
  const [error, setError] = useState<string>()
  const [conflict, setConflict] = useState<SyncConflict | null>(null)
  const [ready, setReady] = useState(false)
  const projectRef = useRef(project)
  const recordRef = useRef<CloudProjectRecord | null>(null)
  const lastSyncedRef = useRef('')
  const readyRef = useRef(false)
  const savingRef = useRef(false)

  useEffect(() => {
    projectRef.current = project
  }, [project])

  const markSynced = useCallback((activeUser: User, record: Pick<CloudProjectRecord, 'id' | 'version' | 'updated_at'>, document: NovelProject) => {
    lastSyncedRef.current = serialize(document)
    writeMetadata(cacheKey, activeUser.id, record, document)
    setLastSyncedAt(record.updated_at)
    setError(undefined)
    setStatus('synced')
  }, [cacheKey])

  const saveDocument = useCallback(async (activeUser: User, document: NovelProject, recordOverride?: CloudProjectRecord) => {
    const currentRecord = recordOverride ?? recordRef.current
    if (!currentRecord || savingRef.current) return
    savingRef.current = true
    setStatus('saving')
    try {
      const withCloudMedia = await uploadPendingMedia(document)
      if (withCloudMedia !== document) {
        projectRef.current = withCloudMedia
        setProject(withCloudMedia)
      }
      const result = await saveCloudProject(currentRecord.id, currentRecord.version, withCloudMedia)
      const nextRecord: CloudProjectRecord = { ...currentRecord, ...result, document: withCloudMedia }
      recordRef.current = nextRecord
      markSynced(activeUser, nextRecord, withCloudMedia)
    } catch (caught) {
      const latest = await loadCloudProject(activeUser.id).catch(() => null)
      if (latest && latest.version !== currentRecord.version) {
        readyRef.current = false
        recordRef.current = latest
        setConflict({ local: projectRef.current, remote: latest.document, remoteRecord: latest })
        setStatus('conflict')
      } else {
        setError(caught instanceof Error ? caught.message : '云端保存失败。')
        setStatus('error')
      }
    } finally {
      savingRef.current = false
    }
  }, [markSynced, setProject])

  const initialize = useCallback(async (activeUser: User) => {
    readyRef.current = false
    setReady(false)
    setConflict(null)
    setError(undefined)
    setStatus('loading')
    try {
      const local = projectRef.current
      let remoteRecord = await loadCloudProject(activeUser.id)
      if (!remoteRecord) {
        if (!createWhenMissing) {
          setError('云端项目尚未初始化，请先在本机创作后台登录并上传现有内容。')
          setStatus('error')
          return
        }
        const withCloudMedia = await uploadPendingMedia(local)
        if (withCloudMedia !== local) {
          projectRef.current = withCloudMedia
          setProject(withCloudMedia)
        }
        try {
          remoteRecord = await createCloudProject(activeUser.id, withCloudMedia)
        } catch (createError) {
          remoteRecord = await loadCloudProject(activeUser.id)
          if (!remoteRecord) throw createError
        }
        recordRef.current = remoteRecord
        readyRef.current = true
        setReady(true)
        markSynced(activeUser, remoteRecord, withCloudMedia)
        return
      }

      recordRef.current = remoteRecord
      const localSnapshot = serialize(local)
      const remoteSnapshot = serialize(remoteRecord.document)
      const metadata = readMetadata(cacheKey, activeUser.id)
      if (!hasLocalData) {
        projectRef.current = remoteRecord.document
        setProject(remoteRecord.document)
        readyRef.current = true
        setReady(true)
        markSynced(activeUser, remoteRecord, remoteRecord.document)
        return
      }

      if (metadata?.projectId === remoteRecord.id) {
        const localChanged = localSnapshot !== metadata.snapshot
        const remoteChanged = remoteRecord.version !== metadata.version
        if (localChanged && remoteChanged) {
          setConflict({ local, remote: remoteRecord.document, remoteRecord })
          setStatus('conflict')
          return
        }
        if (localChanged) {
          readyRef.current = true
          setReady(true)
          lastSyncedRef.current = metadata.snapshot
          await saveDocument(activeUser, local, remoteRecord)
          return
        }
      } else if (localSnapshot !== remoteSnapshot) {
        setConflict({ local, remote: remoteRecord.document, remoteRecord })
        setStatus('conflict')
        return
      }

      projectRef.current = remoteRecord.document
      setProject(remoteRecord.document)
      readyRef.current = true
      setReady(true)
      markSynced(activeUser, remoteRecord, remoteRecord.document)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '无法连接云端项目。')
      setStatus('error')
    }
  }, [cacheKey, createWhenMissing, hasLocalData, markSynced, saveDocument, setProject])

  useEffect(() => {
    if (!supabase) return
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!cloudConfigured) return
    if (!user) {
      readyRef.current = false
      setReady(false)
      recordRef.current = null
      setStatus('signed-out')
      return
    }
    void initialize(user)
  }, [initialize, user])

  useEffect(() => {
    if (!user || !readyRef.current || conflict || serialize(project) === lastSyncedRef.current) return
    const timer = window.setTimeout(() => void saveDocument(user, project), 1200)
    return () => window.clearTimeout(timer)
  }, [conflict, project, saveDocument, user])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return
    setError(undefined)
    const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: cloudRedirectUrl() } })
    if (signInError) {
      setError(signInError.message)
      setStatus('error')
      return
    }
    setStatus('link-sent')
  }, [])

  const signInWithGitHub = useCallback(async () => {
    if (!supabase) return
    setError(undefined)
    const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: cloudRedirectUrl() } })
    if (signInError) {
      setError(signInError.message)
      setStatus('error')
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const syncNow = useCallback(async () => {
    if (user && readyRef.current) await saveDocument(user, projectRef.current)
  }, [saveDocument, user])

  const keepLocalVersion = useCallback(async () => {
    if (!user || !conflict) return
    const selected = conflict.local
    const remoteRecord = conflict.remoteRecord
    recordRef.current = remoteRecord
    setConflict(null)
    readyRef.current = true
    setReady(true)
    await saveDocument(user, selected, remoteRecord)
  }, [conflict, saveDocument, user])

  const useCloudVersion = useCallback(() => {
    if (!user || !conflict) return
    projectRef.current = conflict.remote
    setProject(conflict.remote)
    recordRef.current = conflict.remoteRecord
    readyRef.current = true
    setReady(true)
    markSynced(user, conflict.remoteRecord, conflict.remote)
    setConflict(null)
  }, [conflict, markSynced, setProject, user])

  return {
    configured: cloudConfigured,
    ready,
    status,
    userEmail: user?.email,
    lastSyncedAt,
    error,
    hasConflict: Boolean(conflict),
    signInWithEmail,
    signInWithGitHub,
    signOut,
    syncNow,
    keepLocalVersion,
    useCloudVersion,
  }
}
