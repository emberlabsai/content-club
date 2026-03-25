import { LogOutIcon, ChevronDownIcon, UsersIcon } from '../common/Icons'

interface HeaderProps {
  status: 'idle' | 'generating' | 'complete' | 'error'
  onLogout?: () => void
  clients: string[]
  activeClient: string
  onClientChange: (client: string) => void
}

export default function Header({ status, onLogout, clients, activeClient, onClientChange }: HeaderProps) {
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
      <div className="flex items-center gap-6">
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

        <div className="h-8 w-px bg-white/[0.06]" />

        <div className="relative">
          <UsersIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-champagne/40" />
          <select
            value={activeClient}
            onChange={(e) => onClientChange(e.target.value)}
            className="bg-champagne/5 border border-champagne/15 rounded-lg pl-8 pr-7 py-1.5 text-xs text-champagne font-medium appearance-none hover:border-champagne/30 transition-all cursor-pointer"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-champagne/40 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-micro text-stone">{statusLabel}</span>
        </div>
        <div className="text-micro text-stone/50 hidden md:block">VEO 3.1 &middot; NANO BANANA 2 &middot; GEMINI</div>
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
