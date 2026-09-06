import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { loadMediaBlob } from '../mediaStorage'
import { createPrivateMediaUrl } from '../cloud/mediaRepository'
import type { MediaAsset } from '../types'

export function MediaAssetMedia({ asset, controls = true }: { asset: MediaAsset; controls?: boolean }) {
  const publicBase = import.meta.env.BASE_URL.endsWith('/studio/') ? import.meta.env.BASE_URL.slice(0, -'studio/'.length) : import.meta.env.BASE_URL
  const publicSource = asset.publicUrl?.startsWith('/') ? `${publicBase.replace(/\/$/, '')}${asset.publicUrl}` : asset.publicUrl
  const [source, setSource] = useState(publicSource ?? '')

  useEffect(() => {
    let objectUrl = ''
    setSource(publicSource ?? '')
    const loadLocalSource = async () => {
      if (!asset.blobId) return
      const blob = await loadMediaBlob(asset.blobId)
      if (!blob) return
      objectUrl = URL.createObjectURL(blob)
      setSource(objectUrl)
    }
    if (!asset.publicUrl && asset.storagePath) {
      void createPrivateMediaUrl(asset.storagePath).then(setSource).catch(() => void loadLocalSource())
    } else if (!asset.publicUrl && asset.blobId) {
      void loadLocalSource()
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [asset.blobId, asset.publicUrl, asset.storagePath, publicSource])

  if (!source) return <div className="media-placeholder"><ImageIcon size={18} /><span>本地素材</span></div>
  if (asset.type === 'video') return <video src={source} controls={controls} preload="metadata" />
  return <img src={source} alt={asset.title} loading="lazy" />
}
