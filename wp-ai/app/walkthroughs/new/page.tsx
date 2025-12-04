'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ClientSelector } from '@/components/walkthroughs/client-selector'
import { RoomForm } from '@/components/walkthroughs/room-form'
import { ChevronLeft, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react'
import { RoomData } from '@/lib/types'
import { SERVICE_FREQUENCIES, FACILITY_TYPES } from '@/lib/constants'
import { formatHours } from '@/lib/pricing'
import Link from 'next/link'

type Step = 'client' | 'property' | 'rooms' | 'review'

export default function NewWalkthroughPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('client')
  const [showClientForm, setShowClientForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form data
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [newClient, setNewClient] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  })
  const [propertyData, setPropertyData] = useState({
    propertyAddress: '',
    totalSqft: '',
    facilityType: '',
    serviceFrequency: 'daily',
    daysPerWeek: 5,
  })
  const [rooms, setRooms] = useState<RoomData[]>([])

  const totalMinutes = rooms.reduce((sum, room) => sum + room.estimatedMinutes, 0)

  const handleCreateClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })

      if (response.ok) {
        const client = await response.json()
        setSelectedClientId(client.id)
        setShowClientForm(false)
        setStep('property')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client')
    }
  }

  const handleAddRoom = (room: RoomData) => {
    if (editingRoomIndex !== null) {
      const updatedRooms = [...rooms]
      updatedRooms[editingRoomIndex] = room
      setRooms(updatedRooms)
      setEditingRoomIndex(null)
    } else {
      setRooms([...rooms, room])
    }
    setShowRoomForm(false)
  }

  const handleEditRoom = (index: number) => {
    setEditingRoomIndex(index)
    setShowRoomForm(true)
  }

  const handleDeleteRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/walkthroughs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          propertyAddress: propertyData.propertyAddress,
          totalSqft: propertyData.totalSqft ? parseFloat(propertyData.totalSqft) : null,
          facilityType: propertyData.facilityType || null,
          serviceFrequency: propertyData.serviceFrequency,
          daysPerWeek: propertyData.daysPerWeek,
          rooms: rooms.map((room) => ({
            name: room.name,
            roomType: room.roomType,
            squareFeet: room.squareFeet,
            floorType: room.floorType,
            estimatedMinutes: room.estimatedMinutes,
            specialNotes: room.specialNotes,
          })),
        }),
      })

      if (response.ok) {
        const walkthrough = await response.json()
        router.push(`/walkthroughs/${walkthrough.id}/pricing`)
      } else {
        alert('Failed to create walkthrough')
      }
    } catch (error) {
      console.error('Error creating walkthrough:', error)
      alert('Failed to create walkthrough')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <button className="p-2 hover:bg-card rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold">New Walkthrough</h1>
            <p className="text-sm text-text-secondary">
              {step === 'client' && 'Select or create a client'}
              {step === 'property' && 'Property details'}
              {step === 'rooms' && 'Add rooms to clean'}
              {step === 'review' && 'Review and create proposal'}
            </p>
          </div>
        </div>

        {/* Step 1: Client Selection */}
        {step === 'client' && !showClientForm && (
          <div className="space-y-4">
            <ClientSelector
              selectedClientId={selectedClientId}
              onSelect={setSelectedClientId}
              onCreateNew={() => setShowClientForm(true)}
            />
            {selectedClientId && (
              <button
                onClick={() => setStep('property')}
                className="w-full bg-neon-lime text-background font-semibold py-3 rounded-lg hover:bg-neon-lime/90 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Client Form */}
        {step === 'client' && showClientForm && (
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  placeholder="ABC Company"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Name</label>
                <input
                  type="text"
                  value={newClient.contactName}
                  onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  placeholder="john@abc.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowClientForm(false)}
                  className="flex-1 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-card/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClient}
                  disabled={!newClient.name}
                  className="flex-1 px-4 py-3 bg-neon-lime text-background rounded-lg font-medium hover:bg-neon-lime/90 transition-colors disabled:opacity-50"
                >
                  Create Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 'property' && (
          <div className="space-y-4">
            <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Property Address *</label>
                  <input
                    type="text"
                    value={propertyData.propertyAddress}
                    onChange={(e) =>
                      setPropertyData({ ...propertyData, propertyAddress: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                    placeholder="123 Business Blvd, City, State"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Sq Ft</label>
                    <input
                      type="number"
                      value={propertyData.totalSqft}
                      onChange={(e) =>
                        setPropertyData({ ...propertyData, totalSqft: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Facility Type</label>
                    <select
                      value={propertyData.facilityType}
                      onChange={(e) =>
                        setPropertyData({ ...propertyData, facilityType: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      {FACILITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service Frequency</label>
                  <select
                    value={propertyData.serviceFrequency}
                    onChange={(e) => {
                      const freq = SERVICE_FREQUENCIES.find((f) => f.value === e.target.value)
                      setPropertyData({
                        ...propertyData,
                        serviceFrequency: e.target.value,
                        daysPerWeek: freq?.daysPerWeek || 5,
                      })
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                  >
                    {SERVICE_FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                {propertyData.serviceFrequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Days Per Week</label>
                    <input
                      type="number"
                      value={propertyData.daysPerWeek}
                      onChange={(e) =>
                        setPropertyData({
                          ...propertyData,
                          daysPerWeek: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
                      min="1"
                      max="7"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('client')}
                className="flex-1 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-card/80 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('rooms')}
                disabled={!propertyData.propertyAddress}
                className="flex-1 px-4 py-3 bg-neon-lime text-background rounded-lg font-medium hover:bg-neon-lime/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rooms */}
        {step === 'rooms' && !showRoomForm && (
          <div className="space-y-4">
            {/* Total Time Display */}
            <div className="bg-neon-lime/10 border border-neon-lime rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total Daily Time</span>
                <span className="text-2xl font-bold text-neon-lime">
                  {formatHours(totalMinutes / 60)}
                </span>
              </div>
            </div>

            {/* Rooms List */}
            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-text-secondary">{room.roomType}</p>
                      <p className="text-sm text-neon-lime mt-1">{room.estimatedMinutes} min</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoom(index)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(index)}
                        className="p-2 hover:bg-accent-orange/10 text-accent-orange rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRoomForm(true)}
              className="w-full bg-neon-lime/10 border border-neon-lime text-neon-lime font-medium py-3 rounded-lg hover:bg-neon-lime/20 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Room
            </button>

            {rooms.length > 0 && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('property')}
                  className="flex-1 px-4 py-3 bg-card border border-border rounded-lg font-medium hover:bg-card/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-neon-lime text-background rounded-lg font-medium hover:bg-neon-lime/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Continue to Pricing'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Room Form Modal */}
        {step === 'rooms' && showRoomForm && (
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-6">
            <h2 className="text-xl font-heading font-semibold mb-4">
              {editingRoomIndex !== null ? 'Edit Room' : 'Add Room'}
            </h2>
            <RoomForm
              room={editingRoomIndex !== null ? rooms[editingRoomIndex] : undefined}
              onSave={handleAddRoom}
              onCancel={() => {
                setShowRoomForm(false)
                setEditingRoomIndex(null)
              }}
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
