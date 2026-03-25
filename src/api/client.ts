import type { GenerateVideoParams } from '../types'

export async function refinePrompt(prompt: string): Promise<string> {
  const res = await fetch('/api/refine-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) {
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
    headers: { 'Content-Type': 'application/json' },
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
    const err = await res.json().catch(() => ({ error: 'Video generation failed' }))
    throw new Error(err.error || 'Video generation failed')
  }

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  return { blob, objectUrl }
}
