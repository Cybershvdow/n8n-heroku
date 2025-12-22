'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadCard } from '@/components/loads/load-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Load {
  id: string;
  source: string;
  status: 'PENDING' | 'ACCEPTED' | 'DENIED';
  brokerCarrierName: string | null;
  pickupLocation: string | null;
  pickupDateTime: string | null;
  dropoffLocation: string | null;
  dropoffDateTime: string | null;
  rate: number | null;
  commodity: string | null;
  referenceNumber: string | null;
  aiSummary: string | null;
  confidenceScore: number | null;
  missingFields: string[];
  createdAt: string;
}

type StatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'DENIED';

export default function DashboardPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLoads();
  }, [filter, page]);

  async function fetchLoads() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filter !== 'ALL') {
        params.set('status', filter);
      }

      const res = await fetch(`/api/loads?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) {
          setLoads(data.loads);
        } else {
          setLoads((prev) => [...prev, ...data.loads]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch loads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(loadId: string, decision: 'ACCEPTED' | 'DENIED') {
    try {
      const res = await fetch(`/api/loads/${loadId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        // Update load in state
        setLoads((prev) =>
          prev.map((load) =>
            load.id === loadId ? { ...load, status: decision } : load
          )
        );
      }
    } catch (error) {
      console.error('Failed to make decision:', error);
    }
  }

  function handleFilterChange(newFilter: StatusFilter) {
    setFilter(newFilter);
    setPage(1);
    setLoads([]);
  }

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Denied', value: 'DENIED' },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 py-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleFilterChange(btn.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === btn.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Loads list */}
        <div className="space-y-4">
          {loading && loads.length === 0 ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))
          ) : loads.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No loads found</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter !== 'ALL'
                  ? `No ${filter.toLowerCase()} loads`
                  : 'Connect your email to start receiving loads'}
              </p>
            </div>
          ) : (
            <>
              {loads.map((load) => (
                <LoadCard
                  key={load.id}
                  load={load}
                  onDecision={handleDecision}
                />
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => p + 1)}
                    loading={loading}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
