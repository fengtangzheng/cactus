import { useEffect, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { loadMediaBlob } from '../mediaStorage'
import type { MediaAsset } from '../types'

export function MediaAssetMedia({ asset, controls = true }: { asset: MediaAsset; controls?: boolean }) {
  const [source, setSource] = useState(asset.publicUrl ?? '')

  useEffect(() => {
    let objectUrl = ''
    setSource(asset.publicUrl ?? '')
    if (!asset.publicUrl && asset.blobId) {
      void loadMediaBlob(asset.blobId).then((blob) => {
        if (!blob) return
        objectUrl = URL.createObjectURL(blob)
        setSource(objectUrl)
      })
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [asset.blobId, asset.publicUrl])

  if (!source) return <div className="media-placeholder"><ImageIcon size={18} /><span>本地素材</span></div>
  if (asset.type === 'video') return <video src={source} controls={controls} preload="metadata" />
  return <img src={source} alt={asset.title} loading="lazy" />
}
