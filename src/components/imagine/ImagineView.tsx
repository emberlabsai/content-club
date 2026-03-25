import { useState } from 'react'
import { generateImage } from '../../api/client'
import type { AssetItem } from '../../types'
import {
  ImagePlusIcon,
  SparklesIcon,
  DownloadIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from '../common/Icons'

interface ImagineViewProps {
  onSaveAsset: (asset: AssetItem) => void
}

const IMAGE_TEMPLATES = [
  { name: 'Fashion Editorial', prompt: 'A high-fashion model in avant-garde clothing, dramatic studio lighting, Vogue editorial style, sharp focus, luxury aesthetic' },
  { name: 'Product Flat Lay', prompt: 'Luxury fashion accessories arranged in a minimalist flat lay composition, soft studio lighting, marble surface, high-end commercial photography' },
  { name: 'Brand Mood Board', prompt: 'Elegant mood board composition with fabric swatches, gold accents, dried flowers, and luxury textures, overhead shot, editorial styling' },
  { name: 'Campaign Visual', prompt: 'Cinematic fashion campaign photograph, golden hour lighting, Mediterranean setting, flowing garments, aspirational luxury lifestyle' },
]

export default function ImagineView({ onSaveAsset }: ImagineViewProps) {
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [count, setCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<{ base64: string; mimeType: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])

    try {
      const images = await generateImage(prompt, aspectRatio, count)
      setGeneratedImages(images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToAssets = (img: { base64: string; mimeType: string }, index: number) => {
    const asset: AssetItem = {
      id: crypto.randomUUID(),
      type: 'image',
      name: `Imagen_${new Date().toISOString().slice(0, 10)}_${index + 1}`,
      previewUrl: `data:${img.mimeType};base64,${img.base64}`,
      base64: img.base64,
      mimeType: img.mimeType,
      createdAt: Date.now(),
      source: 'imagen',
      prompt,
    }
    onSaveAsset(asset)
  }

  const handleDownload = (img: { base64: string; mimeType: string }, index: number) => {
    const link = document.createElement('a')
    link.href = `data:${img.mimeType};base64,${img.base64}`
    link.download = `tcc-imagen-${Date.now()}-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ImagePlusIcon className="w-5 h-5 text-champagne/60" />
          <h2 className="serif text-2xl font-light tracking-tight text-ivory">Imagine</h2>
        </div>
        <p className="text-xs text-stone/50 ml-8">
          Generate images with Imagen 3 — create assets for your video productions
        </p>
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 focus-within:border-champagne/20 transition-all">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="w-full bg-transparent text-ivory text-sm placeholder-stone/30 resize-none min-h-[80px] max-h-[160px] leading-relaxed"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg pl-3 pr-7 py-1.5 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
                >
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="4:3">4:3</option>
                  <option value="3:4">3:4</option>
                </select>
                <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone/30 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg pl-3 pr-7 py-1.5 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
                >
                  <option value={1}>1 image</option>
                  <option value={2}>2 images</option>
                  <option value={4}>4 images</option>
                </select>
                <ChevronDownIcon className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone/30 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <SparklesIcon className="w-3.5 h-3.5 animate-pulse-gold" />
                  Generating...
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Templates */}
      {generatedImages.length === 0 && !isGenerating && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="w-3.5 h-3.5 text-champagne/60" />
            <span className="text-micro text-stone">Templates</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => setPrompt(t.prompt)}
                className="group text-left p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-champagne/20 hover:bg-champagne/[0.03] transition-all"
              >
                <span className="text-xs font-medium text-ivory/80 group-hover:text-champagne transition-colors">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl animate-fade-in">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isGenerating && (
        <div className="flex flex-col items-center py-16 animate-fade-in">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border border-champagne/10" />
            <div className="absolute inset-0 rounded-full border-t border-champagne/60 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-champagne text-lg">✦</span>
            </div>
          </div>
          <p className="text-micro text-stone/60">Generating with Imagen 3...</p>
        </div>
      )}

      {/* Results */}
      {generatedImages.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-micro text-stone mb-4">Generated Images</h3>
          <div className={`grid gap-4 ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
            {generatedImages.map((img, i) => (
              <div
                key={i}
                className="group relative bg-onyx rounded-xl overflow-hidden border border-white/[0.06]"
              >
                <img
                  src={`data:${img.mimeType};base64,${img.base64}`}
                  alt={`Generated ${i + 1}`}
                  className="w-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleSaveToAssets(img, i)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-champagne/20 text-champagne text-[10px] font-medium rounded-md hover:bg-champagne/30 transition-all"
                    >
                      Save to Assets
                    </button>
                    <button
                      onClick={() => handleDownload(img, i)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-ivory text-[10px] rounded-md hover:bg-white/20 transition-all"
                    >
                      <DownloadIcon className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
