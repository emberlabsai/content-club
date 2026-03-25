import type { HistoryItem } from '../../types'
import { ClockIcon } from '../common/Icons'

interface VideoCardProps {
  item: HistoryItem
  onSelect: (item: HistoryItem) => void
}

export default function VideoCard({ item, onSelect }: VideoCardProps) {
  const date = new Date(item.createdAt)
  const timeAgo = getRelativeTime(date)

  return (
    <button
      onClick={() => onSelect(item)}
      className="group text-left bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-champagne/20 transition-all duration-500"
    >
      {item.thumbnailUrl ? (
        <div className="aspect-video bg-onyx overflow-hidden">
          <img
            src={item.thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
          />
        </div>
      ) : (
        <div className="aspect-video bg-onyx flex items-center justify-center">
          <span className="text-stone/20 text-3xl">✦</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-ivory/70 line-clamp-2 leading-relaxed mb-2">
          {item.prompt || 'No prompt'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-3 h-3 text-stone/30" />
            <span className="text-[10px] text-stone/40">{timeAgo}</span>
          </div>
          {item.client && (
            <span className="text-[9px] uppercase tracking-wider text-champagne/50 bg-champagne/5 px-2 py-0.5 rounded-full">
              {item.client}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function getRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
