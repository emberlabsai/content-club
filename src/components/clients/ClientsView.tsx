import { useState } from 'react'
import type { ClientProfile } from '../../types'
import { UsersIcon, PlusIcon, XIcon } from '../common/Icons'

interface ClientsViewProps {
  clients: ClientProfile[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

export default function ClientsView({ clients, onAdd, onRemove }: ClientsViewProps) {
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
    setIsAdding(false)
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UsersIcon className="w-5 h-5 text-champagne/60" />
            <h2 className="serif text-2xl font-light tracking-tight text-ivory">Clients</h2>
          </div>
          <p className="text-xs text-stone/50 ml-8">
            Manage your brand profiles
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-champagne/10 border border-champagne/20 rounded-lg text-xs text-champagne hover:bg-champagne/15 transition-all"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-white/[0.02] border border-champagne/10 rounded-xl animate-fade-in">
          <label className="text-micro text-stone/50 block mb-2">Brand Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. JLUXLABEL"
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-ivory placeholder-stone/30 focus:border-champagne/20 transition-all"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-5 py-2.5 bg-champagne text-obsidian font-semibold text-xs rounded-lg hover:bg-champagne-glow disabled:opacity-30 transition-all"
            >
              Add
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewName('') }}
              className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-stone hover:text-ivory transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {clients.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-stone/10 text-6xl mb-6">✦</span>
          <h3 className="serif text-xl font-light text-ivory/60 mb-2">No Clients Yet</h3>
          <p className="text-xs text-stone/40 max-w-sm">
            Add your first brand client to start organizing your productions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-champagne/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-ivory mb-1">{client.name}</h3>
                  <p className="text-[10px] text-stone/40">
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(client.id)}
                  className="p-1.5 rounded-md text-stone/30 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
