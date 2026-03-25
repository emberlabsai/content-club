import { Router, Request, Response } from 'express'
import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai'

const router = Router()

function getAI(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY environment variable is not set')
  return new GoogleGenAI({ apiKey: key })
}

const PERMISSIVE_SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

const SYSTEM_INSTRUCTION = `You are Tiffany's creative AI assistant inside her private content studio. You specialize in high-end fashion content creation, video production, and luxury brand marketing.

You help with:
- Crafting compelling video prompts for VEO 3.1 video generation
- Brainstorming creative concepts for fashion brands like JLUXLABEL
- Generating and iterating on images for mood boards, lookbooks, and campaigns
- Advising on visual aesthetics, lighting, camera angles, and styling
- Content strategy for luxury fashion brands

Be creative, knowledgeable about fashion, and always aim for elevated, editorial quality. Keep responses concise but rich with actionable creative direction. When generating images, focus on high-end fashion aesthetics.`

// ─── Prompt Refinement (manual, user-triggered only) ─────────────────

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
      config: {
        safetySettings: PERMISSIVE_SAFETY,
      },
    })

    res.json({ refined: response.text?.trim() || prompt })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Prompt refinement failed'
    console.error('[refine-prompt]', message)
    res.status(500).json({ error: message })
  }
})

// ─── Unified Chat (Gemini Pro text + Nano Banana 2 images) ──────────

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model } = req.body
    if (!messages?.length) {
      res.status(400).json({ error: 'Messages are required' })
      return
    }

    const ai = getAI()
    const chatModel = model || 'gemini-2.5-flash'
    const isImageModel = chatModel.includes('image')

    const formattedContents: any[] = []
    for (const m of messages) {
      const parts: any[] = []

      if (m.role === 'model' || m.role === 'assistant') {
        if (m.content) {
          parts.push({ text: m.content })
        }
      } else {
        if (m.content) {
          parts.push({ text: m.content })
        }
        if (m.imageData) {
          parts.push({
            inlineData: {
              data: m.imageData.base64,
              mimeType: m.imageData.mimeType,
            },
          })
        }
      }

      if (parts.length === 0) {
        parts.push({ text: '.' })
      }

      formattedContents.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts,
      })
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      safetySettings: PERMISSIVE_SAFETY,
    }

    if (isImageModel) {
      config.responseModalities = ['Text', 'Image']
    }

    const response = await ai.models.generateContent({
      model: chatModel,
      contents: formattedContents,
      config,
    })

    const responseParts: { type: string; content?: string; base64?: string; mimeType?: string }[] = []

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseParts.push({ type: 'text', content: part.text })
        }
        if (part.inlineData) {
          responseParts.push({
            type: 'image',
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png',
          })
        }
      }
    }

    if (responseParts.length === 0 && response.text) {
      responseParts.push({ type: 'text', content: response.text.trim() })
    }

    res.json({ parts: responseParts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat failed'
    console.error('[chat]', message)
    res.status(500).json({ error: message })
  }
})

// ─── Video Generation (VEO 3.1) ─────────────────────────────────────

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
    const finalPrompt = prompt || ''

    const useImageInput = mode === 'Frames to Video' || mode === 'References to Video' || mode === 'Ingredients to Video'
    const config: Record<string, unknown> = {
      numberOfVideos: 1,
      resolution,
      personGeneration: useImageInput ? 'allow_adult' : 'allow_all',
    }

    if (
      resolution === '1080p' ||
      mode === 'Extend Video' ||
      mode === 'References to Video' ||
      mode === 'Ingredients to Video'
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
    } else if (mode === 'Ingredients to Video') {
      // Combined mode: start frame + end frame + reference images all together
      if (startFrame?.base64) {
        payload.image = {
          imageBytes: startFrame.base64,
          mimeType: startFrame.mimeType || 'image/png',
        }
      }
      if (endFrame?.base64) {
        ;(config as Record<string, unknown>).lastFrame = {
          imageBytes: endFrame.base64,
          mimeType: endFrame.mimeType || 'image/png',
        }
      }
      const refs: VideoGenerationReferenceImage[] = []
      if (referenceImages?.length) {
        for (const img of referenceImages) {
          refs.push({
            image: { imageBytes: img.base64, mimeType: img.mimeType || 'image/png' },
            referenceType: VideoGenerationReferenceType.ASSET,
          })
        }
      }
      if (refs.length) {
        config.referenceImages = refs
      }
    } else if (mode === 'Extend Video' && inputVideo) {
      payload.video = inputVideo
    }

    console.log('[generate-video] Model:', model, '| Mode:', mode, '| Resolution:', resolution)
    console.log('[generate-video] Prompt:', finalPrompt?.slice(0, 200))
    let operation = await ai.models.generateVideos(payload as any)

    let pollCount = 0
    while (!operation.done) {
      await new Promise((r) => setTimeout(r, 10000))
      pollCount++
      console.log(`[generate-video] Polling... (${pollCount * 10}s elapsed)`)
      operation = await ai.operations.getVideosOperation({ operation })
    }

    console.log('[generate-video] Done after', pollCount * 10, 'seconds')

    if (operation.error) {
      const errMsg = typeof operation.error === 'object' && operation.error !== null && 'message' in operation.error
        ? String((operation.error as { message?: unknown }).message)
        : 'Video generation failed'
      console.error('[generate-video] Error:', JSON.stringify(operation.error))
      throw new Error(errMsg)
    }

    const videos = operation.response?.generatedVideos
    if (!videos?.length) {
      const fullResponse = JSON.stringify(operation.response, null, 2)
      console.error('[generate-video] No videos:', fullResponse)

      const responseStr = fullResponse.toLowerCase()
      if (responseStr.includes('celebrity') || responseStr.includes('likeness')) {
        throw new Error(
          'VEO flagged input images as "celebrity likenesses" (known Google false positive with any human face). ' +
          'Use Text-to-Video mode instead — describe the person in your prompt.'
        )
      }
      throw new Error('No videos generated. Try Text-to-Video mode or rephrase your prompt.')
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
