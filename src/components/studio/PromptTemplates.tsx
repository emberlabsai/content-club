import { PROMPT_TEMPLATES } from '../../lib/constants'
import { SparklesIcon } from '../common/Icons'

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void
}

export default function PromptTemplates({ onSelect }: PromptTemplatesProps) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-3.5 h-3.5 text-champagne/60" />
        <span className="text-micro text-stone">Quick Start Templates</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {PROMPT_TEMPLATES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onSelect(t.prompt)}
            className="group text-left p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-champagne/20 hover:bg-champagne/[0.03] transition-all duration-300"
          >
            <span className="text-xs font-medium text-ivory/80 group-hover:text-champagne transition-colors">
              {t.name}
            </span>
            <p className="text-[10px] text-stone/60 mt-0.5 leading-relaxed line-clamp-2">
              {t.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
