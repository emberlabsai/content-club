import { Router, Request, Response } from 'express'
import {
  GoogleGenAI,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai'

const router = Router()

function getAI(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY environment variable is not set')
  return new GoogleGenAI({ apiKey: key })
}

router.post('/refine-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body
    if (!prompt?.trim()) {
      res.json({ refined: prompt || '' })
      return
    }

    const ai = getAI()
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert video prompt engineer for the Veo 3.1 video generation model, specializing in high-end fashion and luxury brand content.

Your task is to take the user's video prompt and enhance it to be optimally understood by Veo, strictly following best practices.

CRITICAL RULE: Do NOT change the core meaning, subject, or action of the user's prompt. Only enhance the descriptive quality, camera directions, and lighting.

Veo Best Practices:
- Start with the main subject and action
- Add specific camera movements (e.g., "tracking shot", "slow pan", "cinematic dolly")
- Specify lighting and atmosphere (e.g., "editorial lighting", "golden hour", "high-contrast studio")
- Include details about the environment and background
- Use fashion/luxury industry terminology where appropriate
- Mention fabric textures, movement quality, and visual rhythm

Original Prompt: "${prompt}"

Return ONLY the refined prompt text. No explanations, quotes, or conversational text.`,
    })

    res.json({ refined: response.text?.trim() || prompt })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt refinement failed'
    console.error('[refine-prompt]', message)
    res.status(500).json({ error: message })
  }
})

router.post('/generate-video', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      model,
      aspectRatio,
      resolution,
      mode,
      startFrame,
      endFrame,
      referenceImages,
      styleImage,
      inputVideo,
      isLooping,
    } = req.body

    const ai = getAI()

    let finalPrompt = prompt || ''
    if (finalPrompt && mode !== 'Extend Video') {
      try {
        const refineRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an expert video prompt engineer for Veo 3.1, specializing in high-end fashion content. Enhance this prompt for optimal video generation without changing its meaning. Add camera directions, lighting, and atmosphere details.

Original: "${finalPrompt}"

Return ONLY the refined prompt.`,
        })
        finalPrompt = refineRes.text?.trim() || finalPrompt
      } catch {
        // Use original prompt if refinement fails
      }
    }

    const config: Record<string, unknown> = {
      numberOfVideos: 1,
      resolution,
      personGeneration: 'allow_adult',
    }

    if (
      resolution === '1080p' ||
      mode === 'Extend Video' ||
      mode === 'References to Video'
    ) {
      config.durationSeconds = 8
    }

    if (mode !== 'Extend Video') {
      config.aspectRatio = aspectRatio
    }

    const payload: Record<string, unknown> = {
      model,
      config,
    }

    if (finalPrompt) {
      payload.prompt = finalPrompt
    }

    if (mode === 'Frames to Video') {
      if (startFrame?.base64) {
        payload.image = {
          imageBytes: startFrame.base64,
          mimeType: startFrame.mimeType || 'image/png',
        }
      }
      const finalEnd = isLooping ? startFrame : endFrame
      if (finalEnd?.base64) {
        ;(config as Record<string, unknown>).lastFrame = {
          imageBytes: finalEnd.base64,
          mimeType: finalEnd.mimeType || 'image/png',
        }
      }
    } else if (mode === 'References to Video') {
      const refs: VideoGenerationReferenceImage[] = []
      if (referenceImages?.length) {
        for (const img of referenceImages) {
          refs.push({
            image: { imageBytes: img.base64, mimeType: img.mimeType || 'image/png' },
            referenceType: VideoGenerationReferenceType.ASSET,
          })
        }
      }
      if (styleImage?.base64) {
        refs.push({
          image: { imageBytes: styleImage.base64, mimeType: styleImage.mimeType || 'image/png' },
          referenceType: VideoGenerationReferenceType.STYLE,
        })
      }
      if (refs.length) {
        config.referenceImages = refs
      }
    } else if (mode === 'Extend Video' && inputVideo) {
      payload.video = inputVideo
    }

    console.log('[generate-video] Submitting generation request...')
    let operation = await ai.models.generateVideos(payload as any)

    while (!operation.done) {
      await new Promise((r) => setTimeout(r, 10000))
      console.log('[generate-video] Polling...')
      operation = await ai.operations.getVideosOperation({ operation })
    }

    if (operation.error) {
      const errMsg = typeof operation.error === 'object' && operation.error !== null && 'message' in operation.error
        ? String((operation.error as { message?: unknown }).message)
        : 'Video generation failed'
      throw new Error(errMsg)
    }

    const videos = operation.response?.generatedVideos
    if (!videos?.length) {
      throw new Error('No videos were generated')
    }

    const videoObj = videos[0].video
    if (!videoObj?.uri) {
      throw new Error('Generated video has no URI')
    }

    const videoUrl = decodeURIComponent(videoObj.uri)
    const videoRes = await fetch(videoUrl, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    })

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video: ${videoRes.status}`)
    }

    const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': videoBuffer.length.toString(),
    })
    res.send(videoBuffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video generation failed'
    console.error('[generate-video]', message)
    res.status(500).json({ error: message })
  }
})

export { router as apiRouter }
