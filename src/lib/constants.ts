import { GenerationMode } from '../types'

export const MODE_LABELS: Record<GenerationMode, string> = {
  [GenerationMode.TEXT_TO_VIDEO]: 'Text',
  [GenerationMode.FRAMES_TO_VIDEO]: 'Frames',
  [GenerationMode.REFERENCES_TO_VIDEO]: 'Reference',
  [GenerationMode.EXTEND_VIDEO]: 'Extend',
}

export const MODE_DESCRIPTIONS: Record<GenerationMode, string> = {
  [GenerationMode.TEXT_TO_VIDEO]:
    'Generate a video from a text description. Best for creative concepts with people — prompts go directly to VEO.',
  [GenerationMode.FRAMES_TO_VIDEO]:
    'Interpolate between a start and end frame. Add a prompt to guide the motion and transformation.',
  [GenerationMode.REFERENCES_TO_VIDEO]:
    'Use up to 3 reference images (characters, products, or styles) to guide the generation. Requires Pro model.',
  [GenerationMode.EXTEND_VIDEO]:
    'Extend an existing 720p video by adding 7 seconds to the end.',
}

export interface PromptTemplate {
  name: string
  description: string
  prompt: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Runway Walk',
    description: 'Model walking the runway',
    prompt:
      'A model walks confidently down a minimalist white runway, wearing a flowing haute couture gown. Dramatic editorial lighting, slow-motion tracking shot, shallow depth of field. Fashion show atmosphere with subtle lens flare.',
  },
  {
    name: 'Product Hero',
    description: 'Luxury product showcase',
    prompt:
      'A luxury handbag rotates slowly on a glossy black surface. Cinematic studio lighting with soft reflections. Extreme close-up dolly shot revealing leather texture and gold hardware details. Premium commercial aesthetic.',
  },
  {
    name: 'Editorial Mood',
    description: 'High-fashion editorial',
    prompt:
      'A model poses against a textured concrete wall, styled in avant-garde fashion. Moody directional lighting, slow cinematic pan. Vogue-style editorial photography come to life. Rich, desaturated color grade.',
  },
  {
    name: 'Behind the Scenes',
    description: 'BTS content creation',
    prompt:
      'Behind-the-scenes footage of a fashion photoshoot. Stylists adjusting garments, photographer directing, camera flashes. Handheld documentary style, warm ambient lighting, authentic creative energy.',
  },
  {
    name: 'Lookbook',
    description: 'Collection showcase',
    prompt:
      'A model showcases a complete outfit with a slow 360-degree turn in a bright, airy studio. Clean white cyclorama background, soft diffused lighting. E-commerce lookbook style with elegant movement.',
  },
  {
    name: 'Campaign Film',
    description: 'Brand campaign cinematic',
    prompt:
      'Cinematic brand film: a woman walks through a sun-dappled Mediterranean courtyard wearing a flowing summer collection. Golden hour lighting, steadicam tracking shot, shallow depth of field. Aspirational luxury lifestyle.',
  },
]

export const LOADING_MESSAGES = [
  'Curating visual elements...',
  'Calibrating cinematic lighting...',
  'Refining fabric textures...',
  'Orchestrating camera movement...',
  'Developing the narrative arc...',
  'Applying high-fidelity rendering...',
  'Polishing the final cut...',
  'Ensuring visual perfection...',
  'Elevating the aesthetic...',
  'Composing the visual story...',
]
