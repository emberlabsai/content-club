import type { AppView } from '../../types'
import { ClapperboardIcon, LayoutGridIcon, UsersIcon } from '../common/Icons'

interface SidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  historyCount: number
  clientCount: number
}

const navItems: { view: AppView; label: string; icon: typeof ClapperboardIcon }[] = [
  { view: 'studio', label: 'Studio', icon: ClapperboardIcon },
  { view: 'gallery', label: 'Gallery', icon: LayoutGridIcon },
  { view: 'clients', label: 'Clients', icon: UsersIcon },
]

export default function Sidebar({ currentView, onNavigate, historyCount, clientCount }: SidebarProps) {
  const getCount = (view: AppView) => {
    if (view === 'gallery') return historyCount
    if (view === 'clients') return clientCount
    return 0
  }

  return (
    <aside className="w-[72px] border-r border-white/[0.06] flex flex-col items-center py-6 gap-2 shrink-0">
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
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-[8px] uppercase tracking-wider mt-1 font-medium">
              {label}
            </span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne/20 text-champagne text-[8px] font-semibold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </aside>
  )
}
