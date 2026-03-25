import { useState, useCallback } from 'react'
import {
  type AppView,
  type GenerateVideoParams,
  type HistoryItem,
  type ClientProfile,
  Resolution,
  GenerationMode,
  AspectRatio,
  VeoModel,
} from './types'
import { generateVideo } from './api/client'
import { useLocalStorage } from './hooks/useLocalStorage'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import PromptForm from './components/studio/PromptForm'
import LoadingState from './components/studio/LoadingState'
import VideoResult from './components/studio/VideoResult'
import GalleryView from './components/gallery/GalleryView'
import ClientsView from './components/clients/ClientsView'

type StudioState = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [view, setView] = useState<AppView>('studio')
  const [studioState, setStudioState] = useState<StudioState>('idle')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(null)
  const [initialFormValues, setInitialFormValues] = useState<GenerateVideoParams | null>(null)
  const [loadingStartTime, setLoadingStartTime] = useState(0)

  const [history, setHistory] = useLocalStorage<HistoryItem[]>('tcc-history', [])
  const [clients, setClients] = useLocalStorage<ClientProfile[]>('tcc-clients', [
    { id: 'jluxlabel', name: 'JLUXLABEL', createdAt: Date.now() },
  ])

  const headerStatus =
    studioState === 'loading'
      ? 'generating'
      : studioState === 'error'
        ? 'error'
        : studioState === 'success'
          ? 'complete'
          : 'idle'

  const captureThumbnail = (url: string): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = url
      video.muted = true
      video.playsInline = true
      video.crossOrigin = 'anonymous'
      video.onloadeddata = () => {
        video.currentTime = 0.5
      }
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = 320
          canvas.height = 180
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, 320, 180)
            resolve(canvas.toDataURL('image/jpeg', 0.6))
          } else {
            resolve(undefined)
          }
        } catch {
          resolve(undefined)
        }
      }
      video.onerror = () => resolve(undefined)
      setTimeout(() => resolve(undefined), 5000)
    })
  }

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    setStudioState('loading')
    setErrorMessage(null)
    setLastConfig(params)
    setInitialFormValues(null)
    setLoadingStartTime(Date.now())

    try {
      const { blob, objectUrl } = await generateVideo(params)
      setVideoUrl(objectUrl)
      setVideoBlob(blob)
      setStudioState('success')

      const thumbnail = await captureThumbnail(objectUrl)

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        client: params.client || '',
        prompt: params.prompt,
        thumbnailUrl: thumbnail,
        params,
        model: params.model,
        resolution: params.resolution,
        aspectRatio: params.aspectRatio,
      }
      setHistory((prev) => [newItem, ...prev])
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      setErrorMessage(msg)
      setStudioState('error')
    }
  }, [setHistory])

  const handleRetry = useCallback(() => {
    if (lastConfig) handleGenerate(lastConfig)
  }, [lastConfig, handleGenerate])

  const handleNewVideo = useCallback(() => {
    setStudioState('idle')
    setVideoUrl(null)
    setVideoBlob(null)
    setErrorMessage(null)
    setLastConfig(null)
    setInitialFormValues(null)
  }, [])

  const handleExtend = useCallback(() => {
    if (!lastConfig || !videoBlob) return
    setInitialFormValues({
      ...lastConfig,
      mode: GenerationMode.EXTEND_VIDEO,
      prompt: '',
      resolution: Resolution.P720,
      startFrame: null,
      endFrame: null,
      referenceImages: [],
      styleImage: null,
      isLooping: false,
    })
    setStudioState('idle')
    setVideoUrl(null)
    setErrorMessage(null)
  }, [lastConfig, videoBlob])

  const handleLoadConcept = useCallback((item: HistoryItem) => {
    setInitialFormValues(item.params)
    setStudioState('idle')
    setVideoUrl(null)
    setErrorMessage(null)
    setLastConfig(item.params)
    setView('studio')
  }, [])

  const handleAddClient = useCallback(
    (name: string) => {
      setClients((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name, createdAt: Date.now() },
      ])
    },
    [setClients]
  )

  const handleRemoveClient = useCallback(
    (id: string) => {
      setClients((prev) => prev.filter((c) => c.id !== id))
    },
    [setClients]
  )

  const canExtend = lastConfig?.resolution === Resolution.P720

  const clientNames = clients.map((c) => c.name)

  return (
    <div className="h-screen flex flex-col bg-obsidian text-ivory font-sans overflow-hidden">
      <div className="noise" />

      <Header status={headerStatus} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={view}
          onNavigate={setView}
          historyCount={history.length}
          clientCount={clients.length}
        />

        <main className="flex-1 overflow-y-auto relative">
          {/* Ambient background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-champagne/[0.015] blur-[180px] rounded-full" />
            <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-champagne/[0.01] blur-[180px] rounded-full" />
          </div>

          <div className="relative z-10 h-full">
            {view === 'studio' && (
              <div className="h-full flex items-center justify-center p-8">
                {studioState === 'idle' && (
                  <PromptForm
                    onGenerate={handleGenerate}
                    clients={clientNames}
                    initialValues={initialFormValues}
                    canExtend={canExtend}
                  />
                )}
                {studioState === 'loading' && (
                  <LoadingState startTime={loadingStartTime} />
                )}
                {studioState === 'success' && videoUrl && (
                  <VideoResult
                    videoUrl={videoUrl}
                    onRetry={handleRetry}
                    onNewVideo={handleNewVideo}
                    onExtend={handleExtend}
                    canExtend={canExtend}
                    aspectRatio={lastConfig?.aspectRatio || AspectRatio.LANDSCAPE}
                    resolution={lastConfig?.resolution || Resolution.P720}
                    model={lastConfig?.model || VeoModel.VEO_FAST}
                    client={lastConfig?.client}
                  />
                )}
                {studioState === 'error' && (
                  <div className="text-center animate-fade-in max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
                      <span className="text-error text-2xl">!</span>
                    </div>
                    <h2 className="serif text-xl font-light text-ivory mb-3">
                      Production Failed
                    </h2>
                    <p className="text-xs text-stone/60 mb-6 leading-relaxed">
                      {errorMessage || 'An unexpected error occurred'}
                    </p>
                    <div className="flex gap-3 justify-center">
                      {lastConfig && (
                        <button
                          onClick={handleRetry}
                          className="px-6 py-2.5 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow transition-all"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={handleNewVideo}
                        className="px-6 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-ivory hover:bg-white/[0.08] transition-all"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {view === 'gallery' && (
              <GalleryView
                history={history}
                clients={clientNames}
                onLoadConcept={handleLoadConcept}
              />
            )}

            {view === 'clients' && (
              <ClientsView
                clients={clients}
                onAdd={handleAddClient}
                onRemove={handleRemoveClient}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
