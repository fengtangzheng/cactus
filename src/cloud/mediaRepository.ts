import { loadMediaBlob } from '../mediaStorage'
import type { MediaAsset, NovelProject } from '../types'
import { requireSupabase } from './supabaseClient'

const BUCKET = 'cactus-private'

function safeFileName(value: string) {
  return value.normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '-').replace(/^-+|-+$/g, '') || 'asset'
}

export async function uploadPrivateMedia(assetId: string, blob: Blob, fileName: string) {
  const client = requireSupabase()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return undefined
  const storagePath = `${user.id}/main/${assetId}/${safeFileName(fileName)}`
  const { error } = await client.storage.from(BUCKET).upload(storagePath, blob, {
    contentType: blob.type || 'application/octet-stream',
    upsert: true,
  })
  if (error) throw error
  return storagePath
}

export async function deletePrivateMedia(storagePath: string) {
  const { error } = await requireSupabase().storage.from(BUCKET).remove([storagePath])
  if (error) throw error
}

export async function createPrivateMediaUrl(storagePath: string) {
  const { data, error } = await requireSupabase().storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export function mergeUploadedMedia(current: NovelProject, uploaded: NovelProject): NovelProject {
  const uploads = new Map((uploaded.media ?? []).filter((asset) => asset.storagePath).map((asset) => [asset.id, asset]))
  return {
    ...current,
    media: current.media?.map((asset) => {
      const result = uploads.get(asset.id)
      if (!result || result.blobId !== asset.blobId || asset.storagePath) return asset
      return { ...asset, storagePath: result.storagePath, source: result.source }
    }),
  }
}

export async function uploadPendingMedia(project: NovelProject) {
  let changed = false
  const media: MediaAsset[] = []
  for (const asset of project.media ?? []) {
    if (!asset.blobId || asset.storagePath || asset.publicUrl) {
      media.push(asset)
      continue
    }
    const blob = await loadMediaBlob(asset.blobId)
    if (!blob) {
      media.push(asset)
      continue
    }
    const storagePath = await uploadPrivateMedia(asset.id, blob, asset.fileName ?? `${asset.id}.${asset.type === 'video' ? 'mp4' : 'jpg'}`)
    media.push(storagePath ? { ...asset, storagePath, source: '云端同步' } : asset)
    changed ||= Boolean(storagePath)
  }
  return changed ? { ...project, media } : project
}
