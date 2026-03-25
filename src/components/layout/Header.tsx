import { LogOutIcon } from '../common/Icons'

interface HeaderProps {
  status: 'idle' | 'generating' | 'complete' | 'error'
  onLogout?: () => void
}

export default function Header({ status, onLogout }: HeaderProps) {
  const statusColor =
    status === 'generating'
      ? 'bg-champagne animate-pulse-gold'
      : status === 'error'
        ? 'bg-error'
        : 'bg-success'

  const statusLabel =
    status === 'generating'
      ? 'Generating'
      : status === 'error'
        ? 'Error'
        : 'Ready'

  return (
    <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-8 shrink-0 relative z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-champagne text-lg">✦</span>
          <div>
            <h1 className="serif text-lg tracking-tight font-light text-ivory leading-none">
              TIFFANY'S AI CONTENT CLUB
            </h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-stone mt-0.5">
              Elevated Content Studio
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-micro text-stone">{statusLabel}</span>
        </div>
        <div className="text-micro text-stone/50">VEO 3.1 &middot; IMAGEN 3 &middot; GEMINI</div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-stone/40 hover:text-ivory hover:bg-white/[0.04] transition-all"
            title="Sign out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  )
}
