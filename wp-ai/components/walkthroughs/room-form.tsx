'use client'

import { useState } from 'react'
import { ROOM_TYPES, ROOM_DEFAULTS } from '@/lib/constants'
import { Camera, Trash2 } from 'lucide-react'
import { RoomData } from '@/lib/types'

interface RoomFormProps {
  room?: RoomData
  onSave: (room: RoomData) => void
  onCancel: () => void
}

export function RoomForm({ room, onSave, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomData>(
    room || {
      name: '',
      roomType: 'office_small',
      squareFeet: undefined,
      floorType: '',
      estimatedMinutes: ROOM_DEFAULTS.office_small,
      specialNotes: '',
      photos: [],
    }
  )

  const handleRoomTypeChange = (roomType: string) => {
    setFormData({
      ...formData,
      roomType,
      estimatedMinutes: ROOM_DEFAULTS[roomType as keyof typeof ROOM_DEFAULTS] || 20,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Room Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
          placeholder="e.g., Main Lobby, Room 101"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Room Type</label>
        <select
          value={formData.roomType}
          onChange={(e) => handleRoomTypeChange(e.target.value)}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
        >
          {ROOM_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Estimated Minutes
          </label>
          <input
            type="number"
            value={formData.estimatedMinutes}
            onChange={(e) =>
              setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })
            }
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Square Feet (optional)
          </label>
          <input
            type="number"
            value={formData.squareFeet || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                squareFeet: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Floor Type (optional)
        </label>
        <input
          type="text"
          value={formData.floorType || ''}
          onChange={(e) => setFormData({ ...formData, floorType: e.target.value })}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
          placeholder="e.g., Carpet, Tile, Hardwood"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Special Notes (optional)
        </label>
        <textarea
          value={formData.specialNotes || ''}
          onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
          rows={3}
          placeholder="Any special requirements or notes..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-card/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-neon-lime text-background rounded-lg font-medium hover:bg-neon-lime/90 transition-colors"
        >
          {room ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  )
}
