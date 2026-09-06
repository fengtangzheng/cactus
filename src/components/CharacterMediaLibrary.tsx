import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Image as ImageIcon, Maximize2, Trash2, Upload, Video, X } from 'lucide-react'
import { deleteMediaBlob, saveMediaBlob } from '../mediaStorage'
import { deletePrivateMedia, uploadPrivateMedia } from '../cloud/mediaRepository'
import type { MediaAsset, MediaRole, Visibility } from '../types'
import { MediaAssetMedia } from './MediaAssetMedia'

interface CharacterMediaLibraryProps {
  characterId: string
  assets: MediaAsset[]
  onChange: (assets: MediaAsset[]) => void
}

export function CharacterMediaLibrary({ characterId, assets, onChange }: CharacterMediaLibraryProps) {
  const [uploading, setUploading] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null)
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!previewAsset) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewAsset(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [previewAsset])

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const additions: MediaAsset[] = []
    for (const file of Array.from(files)) {
      const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      await saveMediaBlob(id, file)
      const storagePath = await uploadPrivateMedia(id, file, file.name).catch(() => undefined)
      additions.push({
        id,
        characterId,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        title: file.name.replace(/\.[^.]+$/, ''),
        caption: '',
        tags: [],
        visibility: 'private',
        role: 'gallery',
        sortOrder: assets.length + additions.length + 1,
        source: storagePath ? '云端上传' : '本地上传',
        blobId: id,
        storagePath,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      })
    }
    onChange([...assets, ...additions])
    setUploading(false)
  }

  function updateAsset(id: string, patch: Partial<MediaAsset>) {
    const uniqueRole = patch.role && patch.role !== 'gallery' ? patch.role : null
    onChange(assets.map((asset) => {
      if (asset.id === id) return { ...asset, ...patch }
      if (uniqueRole && asset.role === uniqueRole) return { ...asset, role: 'gallery' }
      return asset
    }))
  }

  function commitTags(id: string, rawValue: string) {
    updateAsset(id, { tags: rawValue.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })
    setTagDrafts((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  function moveAsset(id: string, direction: -1 | 1) {
    const ordered = [...assets].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = ordered.findIndex((asset) => asset.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= ordered.length) return
    ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]
    onChange(ordered.map((asset, sortOrder) => ({ ...asset, sortOrder: sortOrder + 1 })))
  }

  async function removeAsset(asset: MediaAsset) {
    if (asset.blobId) await deleteMediaBlob(asset.blobId)
    if (asset.storagePath) await deletePrivateMedia(asset.storagePath).catch(() => undefined)
    onChange(assets.filter((item) => item.id !== asset.id))
  }

  return (
    <section className="media-library form-wide">
      <header>
        <div><span className="eyebrow">MEDIA LIBRARY</span><h3>图片与视频</h3><p>本地模式保存在当前浏览器；登录云端后会同步到私有媒体库。</p></div>
        <label className="media-upload-button"><Upload size={15} />{uploading ? '正在保存' : '添加素材'}<input type="file" multiple accept="image/*,video/*" onChange={(event) => void addFiles(event.target.files)} /></label>
      </header>
      <div className="media-grid">
        {assets.map((asset) => (
          <article className="media-card" key={asset.id}>
            <div className="media-preview">
              <MediaAssetMedia asset={asset} />
              <span>{asset.type === 'video' ? <Video size={13} /> : <ImageIcon size={13} />}{asset.type === 'video' ? '视频' : '图片'}</span>
              <button className="media-expand" type="button" aria-label={`放大预览${asset.title}`} onClick={() => setPreviewAsset(asset)}><Maximize2 size={14} /></button>
            </div>
            <div className="media-fields">
              <input aria-label="素材标题" value={asset.title} onChange={(event) => updateAsset(asset.id, { title: event.target.value })} />
              <textarea aria-label="素材说明" rows={2} placeholder="说明这张素材在人物档案中的用途" value={asset.caption} onChange={(event) => updateAsset(asset.id, { caption: event.target.value })} />
              <input
                aria-label="素材标签"
                placeholder="标签，用逗号分隔"
                value={tagDrafts[asset.id] ?? asset.tags.join(', ')}
                onChange={(event) => setTagDrafts((current) => ({ ...current, [asset.id]: event.target.value }))}
                onBlur={(event) => commitTags(asset.id, event.target.value)}
              />
              <select aria-label="素材用途" value={asset.role} onChange={(event) => updateAsset(asset.id, { role: event.target.value as MediaRole })}>
                <option value="portrait">主头像</option><option value="cover">封面</option><option value="graph-avatar">关系图头像</option><option value="gallery">画廊</option>
              </select>
              <button className="media-visibility" onClick={() => updateAsset(asset.id, { visibility: (asset.visibility === 'public' ? 'private' : 'public') as Visibility })}>
                {asset.visibility === 'public' ? <Eye size={13} /> : <EyeOff size={13} />}{asset.visibility === 'public' ? '可公开' : '仅本地'}
              </button>
              <button className="media-order" aria-label={`上移${asset.title}`} onClick={() => moveAsset(asset.id, -1)}><ArrowUp size={13} /></button>
              <button className="media-order" aria-label={`下移${asset.title}`} onClick={() => moveAsset(asset.id, 1)}><ArrowDown size={13} /></button>
              <button className="media-delete" aria-label={`删除${asset.title}`} onClick={() => void removeAsset(asset)}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
        {assets.length === 0 && <div className="media-empty"><ImageIcon size={22} /><strong>还没有媒体素材</strong><span>上传图片或视频，为角色建立视觉档案。</span></div>}
      </div>
      {previewAsset && (
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={`${previewAsset.title}预览`} onMouseDown={() => setPreviewAsset(null)}>
          <section onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span>{previewAsset.type === 'video' ? 'VIDEO PREVIEW' : 'IMAGE PREVIEW'}</span><strong>{previewAsset.title}</strong></div><button type="button" aria-label="关闭素材预览" onClick={() => setPreviewAsset(null)}><X size={20} /></button></header>
            <div className="media-lightbox-preview"><MediaAssetMedia asset={previewAsset} /></div>
            {previewAsset.caption && <p>{previewAsset.caption}</p>}
          </section>
        </div>
      )}
    </section>
  )
}
