import { useRef, useState } from 'react'
import type { AssetItem } from '../../types'
import {
  FolderOpenIcon,
  UploadIcon,
  TrashIcon,
  DownloadIcon,
  CopyIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
} from '../common/Icons'

interface AssetsViewProps {
  assets: AssetItem[]
  onAdd: (asset: AssetItem) => void
  onRemove: (id: string) => void
}

export default function AssetsView({ assets, onAdd, onRemove }: AssetsViewProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = filter === 'all' ? assets : assets.filter((a) => a.type === filter)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      if (!isVideo && !isImage) continue

      const previewUrl = URL.createObjectURL(file)

      let base64: string | undefined
      if (isImage && file.size < 10 * 1024 * 1024) {
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1] || '')
          }
          reader.readAsDataURL(file)
        })
      }

      const asset: AssetItem = {
        id: crypto.randomUUID(),
        type: isVideo ? 'video' : 'image',
        name: file.name,
        previewUrl,
        base64,
        mimeType: file.type,
        createdAt: Date.now(),
        source: 'uploaded',
      }
      onAdd(asset)
    }

    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDownload = (asset: AssetItem) => {
    const link = document.createElement('a')
    if (asset.base64) {
      link.href = `data:${asset.mimeType};base64,${asset.base64}`
    } else {
      link.href = asset.previewUrl
    }
    link.download = asset.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyBase64 = (asset: AssetItem) => {
    if (asset.base64) {
      navigator.clipboard.writeText(asset.base64)
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FolderOpenIcon className="w-5 h-5 text-champagne/60" />
            <h2 className="serif text-2xl font-light tracking-tight text-ivory">Assets</h2>
          </div>
          <p className="text-xs text-stone/50 ml-8">
            {assets.length} asset{assets.length !== 1 ? 's' : ''} — images, videos, and uploads
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-champagne/10 border border-champagne/20 rounded-lg text-xs text-champagne hover:bg-champagne/15 transition-all"
        >
          <UploadIcon className="w-3.5 h-3.5" />
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'image', 'video'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-champagne/15 text-champagne border border-champagne/20'
                : 'bg-white/[0.03] text-stone border border-transparent hover:text-ivory'
            }`}
          >
            {f === 'all' ? 'All' : f === 'image' ? 'Images' : 'Videos'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-stone/10 text-6xl mb-6">✦</span>
          <h3 className="serif text-xl font-light text-ivory/60 mb-2">No Assets Yet</h3>
          <p className="text-xs text-stone/40 max-w-sm">
            Upload files or generate images with Imagen 3. Generated video thumbnails from the Studio are saved here too.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group text-left bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-champagne/20 transition-all"
            >
              <div className="aspect-square bg-onyx overflow-hidden relative">
                {asset.type === 'image' ? (
                  <img
                    src={asset.previewUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-8 h-8 text-stone/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {asset.type === 'image' ? (
                    <ImageIcon className="w-3.5 h-3.5 text-white/40" />
                  ) : (
                    <VideoIcon className="w-3.5 h-3.5 text-white/40" />
                  )}
                </div>
              </div>
              <div className="p-2">
                <p className="text-[10px] text-ivory/60 truncate">{asset.name}</p>
                <p className="text-[9px] text-stone/30 mt-0.5">
                  {asset.source === 'imagen' ? 'Imagen 3' : asset.source === 'uploaded' ? 'Uploaded' : 'Generated'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-charcoal border border-white/[0.08] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-medium text-ivory">{selectedAsset.name}</h3>
                <p className="text-[10px] text-stone/50 mt-0.5">
                  {selectedAsset.source === 'imagen' ? 'Imagen 3' : selectedAsset.source} &middot;{' '}
                  {new Date(selectedAsset.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 rounded-md text-stone hover:text-ivory hover:bg-white/[0.06] transition-all"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedAsset.type === 'image' ? (
                <img
                  src={selectedAsset.previewUrl}
                  alt={selectedAsset.name}
                  className="w-full rounded-lg"
                />
              ) : (
                <video
                  src={selectedAsset.previewUrl}
                  controls
                  className="w-full rounded-lg"
                />
              )}
              {selectedAsset.prompt && (
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <p className="text-micro text-stone/50 mb-1">Prompt</p>
                  <p className="text-xs text-ivory/70">{selectedAsset.prompt}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-4 border-t border-white/[0.06]">
              <button
                onClick={() => handleDownload(selectedAsset)}
                className="flex items-center gap-1.5 px-4 py-2 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow transition-all"
              >
                <DownloadIcon className="w-3.5 h-3.5" /> Download
              </button>
              {selectedAsset.base64 && (
                <button
                  onClick={() => copyBase64(selectedAsset)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.08] transition-all"
                >
                  <CopyIcon className="w-3.5 h-3.5" /> Copy Base64
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => {
                  onRemove(selectedAsset.id)
                  setSelectedAsset(null)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error text-xs rounded-lg hover:bg-error/20 transition-all"
              >
                <TrashIcon className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
