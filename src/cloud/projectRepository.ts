import type { NovelProject } from '../types'
import { requireSupabase } from './supabaseClient'

export interface CloudProjectRecord {
  id: string
  owner_id: string
  slug: string
  document: NovelProject
  version: number
  updated_at: string
}

export async function loadCloudProject(ownerId: string) {
  const { data, error } = await requireSupabase()
    .from('cactus_projects')
    .select('id, owner_id, slug, document, version, updated_at')
    .eq('owner_id', ownerId)
    .eq('slug', 'main')
    .maybeSingle()
  if (error) throw error
  return data as CloudProjectRecord | null
}

export async function createCloudProject(ownerId: string, document: NovelProject) {
  const { data, error } = await requireSupabase()
    .from('cactus_projects')
    .insert({ owner_id: ownerId, slug: 'main', document })
    .select('id, owner_id, slug, document, version, updated_at')
    .single()
  if (error) throw error
  return data as CloudProjectRecord
}

export async function saveCloudProject(projectId: string, expectedVersion: number, document: NovelProject) {
  const { data, error } = await requireSupabase().rpc('save_cactus_project', {
    p_project_id: projectId,
    p_expected_version: expectedVersion,
    p_document: document,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('云端没有返回保存结果。')
  return row as Pick<CloudProjectRecord, 'id' | 'version' | 'updated_at'>
}
