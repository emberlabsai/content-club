import type { HistoryItem } from '../../types'
import VideoCard from './VideoCard'
import { LayoutGridIcon } from '../common/Icons'

interface GalleryViewProps {
  history: HistoryItem[]
  activeClient: string
  onLoadConcept: (item: HistoryItem) => void
}

export default function GalleryView({ history, activeClient, onLoadConcept }: GalleryViewProps) {
  const filtered = activeClient
    ? history.filter((h) => h.client === activeClient)
    : history

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutGridIcon className="w-5 h-5 text-champagne/60" />
            <h2 className="serif text-2xl font-light tracking-tight text-ivory">Gallery</h2>
          </div>
          <p className="text-xs text-stone/50 ml-8">
            {filtered.length} production{filtered.length !== 1 ? 's' : ''}
            {activeClient && ` for ${activeClient}`}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-stone/10 text-6xl mb-6">✦</span>
          <h3 className="serif text-xl font-light text-ivory/60 mb-2">
            {activeClient ? `No Productions for ${activeClient}` : 'No Productions Yet'}
          </h3>
          <p className="text-xs text-stone/40 max-w-sm">
            {activeClient
              ? `Switch to "All Clients" to see everything, or head to the Studio to create content for ${activeClient}.`
              : 'Head to the Studio to create your first video. All generations will appear here.'}
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
