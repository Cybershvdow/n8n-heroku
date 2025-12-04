'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Search, Filter, Plus } from 'lucide-react'
import { PROPOSAL_STATUSES } from '@/lib/constants'
import { formatCurrency } from '@/lib/pricing'
import Link from 'next/link'

interface Proposal {
  id: string
  title: string
  status: string
  monthlyPrice: number
  profitMargin: number
  createdAt: string
  client: {
    name: string
    address?: string
  }
  walkthrough: {
    propertyAddress: string
    rooms: any[]
  }
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchProposals()
  }, [])

  useEffect(() => {
    filterProposals()
  }, [proposals, searchTerm, statusFilter])

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/proposals')
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProposals = () => {
    let filtered = proposals

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.walkthrough.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProposals(filtered)
  }

  const getStatusColor = (status: string) => {
    const statusObj = PROPOSAL_STATUSES.find((s) => s.value === status)
    return statusObj?.color || 'text-text-muted'
  }

  const getStatusLabel = (status: string) => {
    const statusObj = PROPOSAL_STATUSES.find((s) => s.value === status)
    return statusObj?.label || status
  }

  return (
    <AppLayout>
      <div className="min-h-screen px-4 pt-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Proposals</h1>
          <p className="text-text-secondary">Manage and track your proposals</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-lime focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-neon-lime text-background'
                  : 'bg-card border border-border hover:border-border/50'
              }`}
            >
              All ({proposals.length})
            </button>
            {PROPOSAL_STATUSES.map((status) => {
              const count = proposals.filter((p) => p.status === status.value).length
              return (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    statusFilter === status.value
                      ? 'bg-neon-lime text-background'
                      : 'bg-card border border-border hover:border-border/50'
                  }`}
                >
                  {status.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs mb-1">Total Value</p>
            <p className="text-xl font-bold text-neon-lime">
              {formatCurrency(proposals.reduce((sum, p) => sum + p.monthlyPrice, 0))}
            </p>
          </div>
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs mb-1">Sent</p>
            <p className="text-xl font-bold text-accent-blue">
              {proposals.filter((p) => p.status === 'sent').length}
            </p>
          </div>
          <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4">
            <p className="text-text-muted text-xs mb-1">Won</p>
            <p className="text-xl font-bold text-accent-green">
              {proposals.filter((p) => p.status === 'won').length}
            </p>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-neon-lime border-t-transparent rounded-full animate-spin"></div>
              <p className="text-text-muted mt-4">Loading proposals...</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-card/50 border border-border rounded-xl p-12 text-center">
              <p className="text-text-muted mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No proposals match your filters'
                  : 'No proposals yet. Create your first walkthrough!'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/walkthroughs/new">
                  <button className="bg-neon-lime text-background px-6 py-3 rounded-lg font-medium hover:bg-neon-lime/90 transition-colors inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Walkthrough
                  </button>
                </Link>
              )}
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl p-4 hover:border-neon-lime/50 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{proposal.client.name}</h3>
                      <p className="text-sm text-text-secondary">
                        {proposal.walkthrough.propertyAddress}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(proposal.status)} bg-current/10`}>
                      {getStatusLabel(proposal.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-text-muted">
                        {proposal.walkthrough.rooms.length} rooms
                      </span>
                      <span className="text-text-muted">
                        {proposal.profitMargin.toFixed(0)}% margin
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neon-lime">
                        {formatCurrency(proposal.monthlyPrice)}
                      </p>
                      <p className="text-xs text-text-muted">per month</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-text-muted">
                      Created {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
