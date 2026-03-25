import { useState } from 'react'
import { LockIcon } from '../common/Icons'

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>
  error?: string | null
}

export default function LoginScreen({ onLogin, error }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    try {
      await onLogin(username.trim(), password.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-8 relative">
      <div className="noise" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-champagne/[0.015] blur-[180px] rounded-full" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-champagne/[0.01] blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <span className="text-champagne text-3xl block mb-4">✦</span>
          <h1 className="serif text-3xl font-light text-ivory tracking-tight mb-2">
            TIFFANY'S AI CONTENT CLUB
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
            Private Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-micro text-stone/50 block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-ivory placeholder-stone/30 focus:border-champagne/20 transition-all"
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-micro text-stone/50 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-ivory placeholder-stone/30 focus:border-champagne/20 transition-all"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-error text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all mt-6"
          >
            <LockIcon className="w-3.5 h-3.5" />
            {loading ? 'Authenticating...' : 'Enter the Club'}
          </button>
        </form>

        <p className="text-[10px] text-stone/20 text-center mt-8">
          TIFFANY'S AI CONTENT CLUB &middot; Private Studio
        </p>
      </div>
    </div>
  )
}
