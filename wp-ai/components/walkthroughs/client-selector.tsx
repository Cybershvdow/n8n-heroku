'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'

interface Client {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
}

interface ClientSelectorProps {
  selectedClientId?: string
  onSelect: (clientId: string) => void
  onCreateNew: () => void
}

export function ClientSelector({ selectedClientId, onSelect, onCreateNew }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
        />
      </div>

      <button
        onClick={onCreateNew}
        className="w-full bg-neon-lime/10 border border-neon-lime text-neon-lime font-medium py-3 rounded-lg hover:bg-neon-lime/20 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Client
      </button>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            {searchTerm ? 'No clients found' : 'No clients yet. Create your first one!'}
          </div>
        ) : (
          filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedClientId === client.id
                  ? 'border-neon-lime bg-neon-lime/10'
                  : 'border-border bg-card/50 hover:border-border/50 hover:bg-card/80'
              }`}
            >
              <h3 className="font-semibold">{client.name}</h3>
              {client.contactName && (
                <p className="text-sm text-text-secondary">{client.contactName}</p>
              )}
              {client.address && (
                <p className="text-xs text-text-muted mt-1">{client.address}</p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
