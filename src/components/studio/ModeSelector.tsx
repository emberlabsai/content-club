import { GenerationMode } from '../../types'
import { MODE_LABELS } from '../../lib/constants'
import { BaselineIcon, ImageIcon, PaletteIcon, FilmIcon, LayersIcon } from '../common/Icons'

const MODE_ICONS: Record<GenerationMode, typeof BaselineIcon> = {
  [GenerationMode.TEXT_TO_VIDEO]: BaselineIcon,
  [GenerationMode.FRAMES_TO_VIDEO]: ImageIcon,
  [GenerationMode.REFERENCES_TO_VIDEO]: PaletteIcon,
  [GenerationMode.INGREDIENTS]: LayersIcon,
  [GenerationMode.EXTEND_VIDEO]: FilmIcon,
}

const SELECTABLE_MODES = [
  GenerationMode.TEXT_TO_VIDEO,
  GenerationMode.FRAMES_TO_VIDEO,
  GenerationMode.REFERENCES_TO_VIDEO,
  GenerationMode.INGREDIENTS,
]

interface ModeSelectorProps {
  mode: GenerationMode
  onChange: (mode: GenerationMode) => void
  showExtend?: boolean
}

export default function ModeSelector({ mode, onChange, showExtend }: ModeSelectorProps) {
  const modes = showExtend ? [...SELECTABLE_MODES, GenerationMode.EXTEND_VIDEO] : SELECTABLE_MODES

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-lg">
      {modes.map((m) => {
        const Icon = MODE_ICONS[m]
        const isActive = mode === m
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-champagne/15 text-champagne border border-champagne/20'
                : 'text-stone hover:text-ivory hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {MODE_LABELS[m]}
          </button>
        )
      })}
    </div>
  )
}
