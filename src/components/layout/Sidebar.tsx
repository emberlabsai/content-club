import type { AppView } from '../../types'
import {
  ClapperboardIcon,
  LayoutGridIcon,
  UsersIcon,
  ChatIcon,
  FolderOpenIcon,
} from '../common/Icons'

interface SidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  historyCount: number
  clientCount: number
  assetCount: number
}

const navItems: { view: AppView; label: string; icon: typeof ClapperboardIcon }[] = [
  { view: 'studio', label: 'Studio', icon: ClapperboardIcon },
  { view: 'chat', label: 'Gemini', icon: ChatIcon },
  { view: 'assets', label: 'Assets', icon: FolderOpenIcon },
  { view: 'gallery', label: 'Gallery', icon: LayoutGridIcon },
  { view: 'clients', label: 'Clients', icon: UsersIcon },
]

export default function Sidebar({
  currentView,
  onNavigate,
  historyCount,
  clientCount,
  assetCount,
}: SidebarProps) {
  const getCount = (view: AppView) => {
    if (view === 'gallery') return historyCount
    if (view === 'clients') return clientCount
    if (view === 'assets') return assetCount
    return 0
  }

  return (
    <aside className="w-[72px] border-r border-white/[0.06] flex flex-col items-center py-6 gap-1 shrink-0">
      {navItems.map(({ view, label, icon: Icon }) => {
        const isActive = currentView === view
        const count = getCount(view)
        return (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`group relative w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-300 ${
              isActive
                ? 'bg-champagne/10 text-champagne'
                : 'text-stone hover:text-ivory hover:bg-white/[0.04]'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-champagne rounded-r" />
            )}
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-[7px] uppercase tracking-wider mt-0.5 font-medium">
              {label}
            </span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-champagne/20 text-champagne text-[8px] font-semibold rounded-full flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        )
      })}
    </aside>
  )
}
