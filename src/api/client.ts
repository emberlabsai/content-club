import type { GenerateVideoParams } from '../types'

function getToken(): string {
  return localStorage.getItem('tcc-auth-token') || ''
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(err.error || 'Invalid credentials')
  }
  const data = await res.json()
  return data.token
}

export async function verifyToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: authHeaders(),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function refinePrompt(prompt: string): Promise<string> {
  const res = await fetch('/api/refine-prompt', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED')
    const err = await res.json().catch(() => ({ error: 'Refinement failed' }))
    throw new Error(err.error || 'Refinement failed')
  }
  const data = await res.json()
  return data.refined
}

export async function generateVideo(
  params: GenerateVideoParams
): Promise<{ blob: Blob; objectUrl: string }> {
  const res = await fetch('/api/generate-video', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      prompt: params.prompt,
      model: params.model,
      aspectRatio: params.aspectRatio,
      resolution: params.resolution,
      mode: params.mode,
      startFrame: params.startFrame,
      endFrame: params.endFrame,
      referenceImages: params.referenceImages,
      styleImage: params.styleImage,
      inputVideo: params.inputVideo,
      isLooping: params.isLooping,
    }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED')
    const err = await res.json().catch(() => ({ error: 'Video generation failed' }))
    throw new Error(err.error || 'Video generation failed')
  }

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  return { blob, objectUrl }
}

export async function chatWithGemini(
  messages: { role: string; content: string }[],
  model?: string
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages, model }),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED')
    const err = await res.json().catch(() => ({ error: 'Chat failed' }))
    throw new Error(err.error || 'Chat failed')
  }
  const data = await res.json()
  return data.response
}

export async function generateImage(
  prompt: string,
  aspectRatio?: string,
  numberOfImages?: number
): Promise<{ base64: string; mimeType: string }[]> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ prompt, aspectRatio, numberOfImages }),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('SESSION_EXPIRED')
    const err = await res.json().catch(() => ({ error: 'Image generation failed' }))
    throw new Error(err.error || 'Image generation failed')
  }
  const data = await res.json()
  return data.images
}
