import { useState, useEffect } from 'react'
import { LOADING_MESSAGES } from '../../lib/constants'

interface LoadingStateProps {
  startTime: number
}

export default function LoadingState({ startTime }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 4000)
    return () => clearInterval(msgInterval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timeStr = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `0:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center justify-center p-16 animate-fade-in">
      {/* Animated rings */}
      <div className="relative w-28 h-28 mb-14">
        <div className="absolute inset-0 rounded-full border border-champagne/10" />
        <div className="absolute inset-0 rounded-full border-t border-champagne/60 animate-spin-slow" />
        <div className="absolute inset-3 rounded-full border border-champagne/5 animate-pulse" />
        <div className="absolute inset-6 rounded-full border border-champagne/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-champagne text-xl">✦</span>
        </div>
      </div>

      <h2 className="serif text-2xl font-light tracking-wide text-ivory mb-3">
        Production in Progress
      </h2>
      <p className="text-micro text-stone/60 mb-8 transition-opacity duration-700">
        {LOADING_MESSAGES[messageIndex]}
      </p>

      <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse-gold" />
        <span className="mono text-xs text-stone/80">{timeStr}</span>
      </div>

      <p className="text-[10px] text-stone/30 mt-8 max-w-xs text-center leading-relaxed">
        VEO 3.1 typically takes 60-120 seconds for standard generation.
        High-quality renders may take longer.
      </p>
    </div>
  )
}
