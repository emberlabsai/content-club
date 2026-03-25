import { useState } from 'react'
import type { HistoryItem } from '../../types'
import VideoCard from './VideoCard'
import { LayoutGridIcon, UsersIcon, ChevronDownIcon } from '../common/Icons'

interface GalleryViewProps {
  history: HistoryItem[]
  clients: string[]
  onLoadConcept: (item: HistoryItem) => void
}

export default function GalleryView({ history, clients, onLoadConcept }: GalleryViewProps) {
  const [clientFilter, setClientFilter] = useState<string>('all')

  const filtered = clientFilter === 'all'
    ? history
    : history.filter((h) => h.client === clientFilter)

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutGridIcon className="w-5 h-5 text-champagne/60" />
            <h2 className="serif text-2xl font-light tracking-tight text-ivory">Gallery</h2>
          </div>
          <p className="text-xs text-stone/50 ml-8">
            {filtered.length} production{filtered.length !== 1 ? 's' : ''} in this session
          </p>
        </div>

        {clients.length > 0 && (
          <div className="relative">
            <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30" />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-8 py-2 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone/30 pointer-events-none" />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-stone/10 text-6xl mb-6">✦</span>
          <h3 className="serif text-xl font-light text-ivory/60 mb-2">No Productions Yet</h3>
          <p className="text-xs text-stone/40 max-w-sm">
            Head to the Studio to create your first video. All generations from this session will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <VideoCard key={item.id} item={item} onSelect={onLoadConcept} />
          ))}
        </div>
      )}
    </div>
  )
}
