import { useState, useRef, useEffect, useCallback } from 'react'
import {
  type GenerateVideoParams,
  type ImageData,
  GenerationMode,
  VeoModel,
  AspectRatio,
  Resolution,
} from '../../types'
import { MODE_DESCRIPTIONS } from '../../lib/constants'
import { refinePrompt } from '../../api/client'
import ModeSelector from './ModeSelector'
import PromptTemplates from './PromptTemplates'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  SparklesIcon,
  PlusIcon,
  XIcon,
  LayersIcon,
  TvIcon,
  WandIcon,
  UsersIcon,
} from '../common/Icons'

interface PromptFormProps {
  onGenerate: (params: GenerateVideoParams) => void
  clients: string[]
  initialValues?: GenerateVideoParams | null
  canExtend?: boolean
}

function fileToBase64(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1]
      if (b64) {
        resolve({
          base64: b64,
          mimeType: file.type,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        })
      } else reject(new Error('Failed to read file'))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ImageUpload({
  image,
  onSelect,
  onRemove,
  label,
}: {
  image?: ImageData | null
  onSelect: (img: ImageData) => void
  onRemove?: () => void
  label: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const data = await fileToBase64(f)
      onSelect(data)
    }
    if (ref.current) ref.current.value = ''
  }

  if (image) {
    return (
      <div className="relative group w-28 h-20 rounded-lg overflow-hidden border border-white/10">
        <img
          src={image.previewUrl}
          alt={image.name}
          className="w-full h-full object-cover"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="w-28 h-20 rounded-lg border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-champagne/20 flex flex-col items-center justify-center gap-1 transition-all duration-300"
    >
      <PlusIcon className="w-4 h-4 text-stone/60" />
      <span className="text-[9px] uppercase tracking-wider text-stone/40">{label}</span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </button>
  )
}

export default function PromptForm({
  onGenerate,
  clients,
  initialValues,
  canExtend,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState(initialValues?.prompt ?? '')
  const [client, setClient] = useState(initialValues?.client ?? '')
  const [model, setModel] = useState<VeoModel>(initialValues?.model ?? VeoModel.VEO_FAST)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialValues?.aspectRatio ?? AspectRatio.LANDSCAPE)
  const [resolution, setResolution] = useState<Resolution>(initialValues?.resolution ?? Resolution.P720)
  const [mode, setMode] = useState<GenerationMode>(initialValues?.mode ?? GenerationMode.TEXT_TO_VIDEO)
  const [startFrame, setStartFrame] = useState<ImageData | null>(initialValues?.startFrame ?? null)
  const [endFrame, setEndFrame] = useState<ImageData | null>(initialValues?.endFrame ?? null)
  const [referenceImages, setReferenceImages] = useState<ImageData[]>(initialValues?.referenceImages ?? [])
  const [styleImage, setStyleImage] = useState<ImageData | null>(initialValues?.styleImage ?? null)
  const [isLooping, setIsLooping] = useState(initialValues?.isLooping ?? false)
  const [isRefining, setIsRefining] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialValues) {
      setPrompt(initialValues.prompt ?? '')
      setClient(initialValues.client ?? '')
      setModel(initialValues.model ?? VeoModel.VEO_FAST)
      setAspectRatio(initialValues.aspectRatio ?? AspectRatio.LANDSCAPE)
      setResolution(initialValues.resolution ?? Resolution.P720)
      setMode(initialValues.mode ?? GenerationMode.TEXT_TO_VIDEO)
      setStartFrame(initialValues.startFrame ?? null)
      setEndFrame(initialValues.endFrame ?? null)
      setReferenceImages(initialValues.referenceImages ?? [])
      setStyleImage(initialValues.styleImage ?? null)
      setIsLooping(initialValues.isLooping ?? false)
    }
  }, [initialValues])

  useEffect(() => {
    if (mode === GenerationMode.EXTEND_VIDEO) setResolution(Resolution.P720)
    if (mode === GenerationMode.REFERENCES_TO_VIDEO) {
      setModel(VeoModel.VEO)
      setAspectRatio(AspectRatio.LANDSCAPE)
      setResolution(Resolution.P720)
    }
  }, [mode])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [prompt])

  const handleModeChange = (m: GenerationMode) => {
    setMode(m)
    setStartFrame(null)
    setEndFrame(null)
    setReferenceImages([])
    setStyleImage(null)
    setIsLooping(false)
  }

  const handleRefine = async () => {
    if (!prompt.trim() || isRefining) return
    setIsRefining(true)
    try {
      const refined = await refinePrompt(prompt)
      setPrompt(refined)
    } catch (e) {
      console.error('Refinement failed:', e)
    } finally {
      setIsRefining(false)
    }
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onGenerate({
        prompt,
        client,
        model,
        aspectRatio,
        resolution,
        mode,
        startFrame,
        endFrame,
        referenceImages,
        styleImage,
        isLooping,
      })
    },
    [prompt, client, model, aspectRatio, resolution, mode, startFrame, endFrame, referenceImages, styleImage, isLooping, onGenerate]
  )

  const isExtend = mode === GenerationMode.EXTEND_VIDEO
  const isRef = mode === GenerationMode.REFERENCES_TO_VIDEO

  let isDisabled = false
  if (mode === GenerationMode.TEXT_TO_VIDEO) isDisabled = !prompt.trim()
  if (mode === GenerationMode.FRAMES_TO_VIDEO) isDisabled = !startFrame
  if (mode === GenerationMode.REFERENCES_TO_VIDEO) isDisabled = !prompt.trim() || referenceImages.length === 0
  if (mode === GenerationMode.EXTEND_VIDEO) isDisabled = true

  const totalRefs = referenceImages.length + (styleImage ? 1 : 0)

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="serif text-4xl md:text-6xl font-light tracking-tight text-ivory mb-4">
          Create something{' '}
          <span className="italic text-champagne">extraordinary.</span>
        </h2>
        <p className="text-sm text-stone max-w-md mx-auto leading-relaxed">
          Powered by Google's VEO 3.1 — generate cinematic fashion content for your clients.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center mb-6">
        <ModeSelector mode={mode} onChange={handleModeChange} showExtend={canExtend} />
      </div>

      {/* Mode Description */}
      <p className="text-xs text-stone/60 text-center mb-6">{MODE_DESCRIPTIONS[mode]}</p>

      {/* Media Uploads */}
      {mode === GenerationMode.FRAMES_TO_VIDEO && (
        <div className="mb-6 p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-6">
            <ImageUpload
              image={startFrame}
              onSelect={setStartFrame}
              onRemove={() => { setStartFrame(null); setIsLooping(false) }}
              label="Start"
            />
            {!isLooping && (
              <ImageUpload
                image={endFrame}
                onSelect={setEndFrame}
                onRemove={() => setEndFrame(null)}
                label="End"
              />
            )}
          </div>
          <p className="text-[10px] text-stone/40 italic">At least a start frame is required</p>
          {startFrame && !endFrame && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-champagne"
              />
              <span className="text-xs text-stone/60">Create looping video</span>
            </label>
          )}
        </div>
      )}

      {mode === GenerationMode.REFERENCES_TO_VIDEO && (
        <div className="mb-6 p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col items-center gap-4 animate-fade-in">
          <span className="text-micro text-stone/60">References ({referenceImages.length}/3)</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {referenceImages.map((img, i) => (
              <ImageUpload
                key={i}
                image={img}
                onSelect={() => {}}
                onRemove={() => setReferenceImages((prev) => prev.filter((_, idx) => idx !== i))}
                label=""
              />
            ))}
            {totalRefs < 3 && (
              <ImageUpload
                onSelect={(img) => setReferenceImages((prev) => [...prev, img])}
                label="Add"
              />
            )}
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="relative mb-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 focus-within:border-champagne/20 transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === GenerationMode.TEXT_TO_VIDEO
                ? 'Describe the video you want to create...'
                : mode === GenerationMode.FRAMES_TO_VIDEO
                  ? 'Describe the motion between frames (optional)...'
                  : mode === GenerationMode.REFERENCES_TO_VIDEO
                    ? 'Describe the video using your references...'
                    : 'Describe what happens next (optional)...'
            }
            className="w-full bg-transparent text-ivory text-sm placeholder-stone/30 resize-none min-h-[80px] max-h-[200px] leading-relaxed"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefine}
                disabled={!prompt.trim() || isRefining}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all duration-300 ${
                  isRefining
                    ? 'bg-champagne/10 text-champagne animate-pulse-gold'
                    : 'text-stone hover:text-champagne hover:bg-champagne/5 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <WandIcon className="w-3 h-3" />
                {isRefining ? 'Refining...' : 'Refine'}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all duration-300 ${
                  showTemplates
                    ? 'bg-champagne/10 text-champagne'
                    : 'text-stone hover:text-champagne hover:bg-champagne/5'
                }`}
              >
                <SparklesIcon className="w-3 h-3" />
                Templates
              </button>
            </div>
            <button
              type="submit"
              disabled={isDisabled}
              className="flex items-center gap-2 px-6 py-2.5 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              Generate
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && mode === GenerationMode.TEXT_TO_VIDEO && (
        <div className="mb-6">
          <PromptTemplates onSelect={(p) => { setPrompt(p); setShowTemplates(false) }} />
        </div>
      )}

      {/* Settings Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div>
          <label className="text-micro text-stone/50 block mb-1.5">Client</label>
          <div className="relative">
            <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30" />
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2.5 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-micro text-stone/50 block mb-1.5">Model</label>
          <div className="relative">
            <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30" />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as VeoModel)}
              disabled={isRef}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2.5 text-xs text-ivory appearance-none disabled:opacity-40 hover:border-white/10 transition-all"
            >
              <option value={VeoModel.VEO_FAST}>Veo 3.1 Fast</option>
              <option value={VeoModel.VEO}>Veo 3.1 Pro</option>
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-micro text-stone/50 block mb-1.5">Aspect Ratio</label>
          <div className="relative">
            <LayersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30" />
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              disabled={isRef}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2.5 text-xs text-ivory appearance-none disabled:opacity-40 hover:border-white/10 transition-all"
            >
              <option value={AspectRatio.LANDSCAPE}>16:9 Landscape</option>
              <option value={AspectRatio.PORTRAIT}>9:16 Portrait</option>
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-micro text-stone/50 block mb-1.5">Resolution</label>
          <div className="relative">
            <TvIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30" />
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as Resolution)}
              disabled={isExtend || isRef}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2.5 text-xs text-ivory appearance-none disabled:opacity-40 hover:border-white/10 transition-all"
            >
              <option value={Resolution.P720}>720p</option>
              <option value={Resolution.P1080}>1080p</option>
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30 pointer-events-none" />
          </div>
          {resolution === Resolution.P1080 && !isExtend && !isRef && (
            <p className="text-[9px] text-champagne/50 mt-1">1080p videos cannot be extended</p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-stone/20 text-center">
        TIFFANY'S AI CONTENT CLUB &middot; Powered by Google VEO 3.1
      </p>
    </form>
  )
}
