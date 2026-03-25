export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export type AppView = 'studio' | 'gallery' | 'clients' | 'chat' | 'assets'

export interface ImageData {
  base64: string
  mimeType: string
  name: string
  previewUrl: string
}

export interface GenerateVideoParams {
  prompt: string
  client?: string
  model: VeoModel
  aspectRatio: AspectRatio
  resolution: Resolution
  mode: GenerationMode
  startFrame?: ImageData | null
  endFrame?: ImageData | null
  referenceImages?: ImageData[]
  styleImage?: ImageData | null
  inputVideo?: unknown
  isLooping?: boolean
}

export interface HistoryItem {
  id: string
  createdAt: number
  client: string
  prompt: string
  thumbnailUrl?: string
  params: GenerateVideoParams
  model: VeoModel
  resolution: Resolution
  aspectRatio: AspectRatio
}

export interface ClientProfile {
  id: string
  name: string
  createdAt: number
}

export interface ChatMessagePart {
  type: 'text' | 'image'
  content?: string
  base64?: string
  mimeType?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: ChatMessagePart[]
  timestamp: number
}

export interface AssetItem {
  id: string
  type: 'image' | 'video'
  name: string
  previewUrl: string
  base64?: string
  mimeType: string
  createdAt: number
  source: 'generated' | 'uploaded' | 'nano-banana'
  prompt?: string
  client?: string
}
