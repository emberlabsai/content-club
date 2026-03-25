import { useState, useRef } from 'react'
import { AspectRatio, Resolution, VeoModel } from '../../types'
import {
  DownloadIcon,
  RefreshIcon,
  FileImageIcon,
  SparklesIcon,
  PlusIcon,
  MaximizeIcon,
} from '../common/Icons'
import gifshot from 'gifshot'

interface VideoResultProps {
  videoUrl: string
  onRetry: () => void
  onNewVideo: () => void
  onExtend: () => void
  canExtend: boolean
  aspectRatio: AspectRatio
  resolution: Resolution
  model: VeoModel
  client?: string
}

export default function VideoResult({
  videoUrl,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
  aspectRatio,
  resolution,
  model,
  client,
}: VideoResultProps) {
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT
  const [isConvertingGif, setIsConvertingGif] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleDownloadGif = async () => {
    if (!videoUrl) return
    setIsConvertingGif(true)

    try {
      const video = document.createElement('video')
      video.src = videoUrl
      video.muted = true
      video.playsInline = true
      video.crossOrigin = 'anonymous'

      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) resolve()
        else video.onloadedmetadata = () => resolve()
      })

      const duration = video.duration
      const width = isPortrait ? 360 : 640
      const height = isPortrait ? 640 : 360
      const frames = Math.floor(duration * 10)
      const step = duration / frames

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      const images: string[] = []

      for (let i = 0; i < frames; i++) {
        video.currentTime = i * step
        if (i > 0) {
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked)
              resolve()
            }
            video.addEventListener('seeked', onSeeked)
          })
        }
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height)
          images.push(canvas.toDataURL('image/jpeg', 0.8))
        }
      }

      gifshot.createGIF(
        {
          images,
          interval: 0.1,
          gifWidth: width,
          gifHeight: height,
          numFrames: frames,
          sampleInterval: 10,
        },
        (obj: { error: boolean; image: string }) => {
          if (!obj.error) {
            const link = document.createElement('a')
            link.href = obj.image
            link.download = `tiffanys-content-club-${Date.now()}.gif`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
          setIsConvertingGif(false)
        }
      )
    } catch {
      setIsConvertingGif(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center animate-fade-in px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div>
          <h2 className="serif text-2xl font-light tracking-tight text-ivory">
            Production Complete
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-micro text-stone/50">
              {model === VeoModel.VEO ? 'Veo 3.1 Pro' : 'Veo 3.1 Fast'}
            </span>
            <span className="text-stone/20">&middot;</span>
            <span className="text-micro text-stone/50">{resolution}</span>
            <span className="text-stone/20">&middot;</span>
            <span className="text-micro text-stone/50">{aspectRatio}</span>
            {client && (
              <>
                <span className="text-stone/20">&middot;</span>
                <span className="text-micro text-champagne/60">{client}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onNewVideo}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.04] transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          New Video
        </button>
      </div>

      {/* Video */}
      <div
        className={`relative group ${
          isPortrait ? 'h-[65vh] aspect-[9/16]' : 'w-full max-w-5xl aspect-video'
        } bg-onyx rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
        />
      </div>

      {/* Duration */}
      {videoDuration > 0 && (
        <div className="mt-3 text-micro text-stone/40">
          Duration: {videoDuration.toFixed(1)}s
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.08] transition-all"
        >
          <RefreshIcon className="w-3.5 h-3.5 text-stone" />
          Retry
        </button>

        <a
          href={videoUrl}
          download={`tiffanys-content-club-${Date.now()}.mp4`}
          className="flex items-center gap-2 px-6 py-2.5 bg-champagne text-obsidian font-semibold rounded-lg text-xs hover:bg-champagne-glow transition-all"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
          Export MP4
        </a>

        <button
          onClick={handleDownloadGif}
          disabled={isConvertingGif}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.08] disabled:opacity-40 transition-all"
        >
          {isConvertingGif ? (
            <div className="w-3.5 h-3.5 border border-stone/30 border-t-champagne rounded-full animate-spin" />
          ) : (
            <FileImageIcon className="w-3.5 h-3.5 text-stone" />
          )}
          {isConvertingGif ? 'Converting...' : 'Export GIF'}
        </button>

        {canExtend && (
          <button
            onClick={onExtend}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.08] transition-all"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-champagne/60" />
            Extend +7s
          </button>
        )}
      </div>
    </div>
  )
}
