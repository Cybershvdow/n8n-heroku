'use client';

import { useState } from 'react';
import { Mail, MapPin, Calendar, DollarSign, Package, AlertCircle, Check, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge, LoadStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime, formatCurrency, formatRelativeTime } from '@/lib/utils';

interface LoadCardProps {
  load: {
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
  };
  onDecision?: (loadId: string, decision: 'ACCEPTED' | 'DENIED') => Promise<void>;
  onClick?: () => void;
}

export function LoadCard({ load, onDecision, onClick }: LoadCardProps) {
  const [deciding, setDeciding] = useState<'ACCEPTED' | 'DENIED' | null>(null);

  const handleDecision = async (decision: 'ACCEPTED' | 'DENIED') => {
    if (!onDecision || deciding) return;

    setDeciding(decision);
    try {
      await onDecision(load.id, decision);
    } finally {
      setDeciding(null);
    }
  };

  const summaryBullets = load.aiSummary
    ?.split('\n')
    .filter((line) => line.trim().startsWith('•'))
    .slice(0, 4) ?? [];

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 truncate">
              {load.brokerCarrierName ?? 'Unknown Sender'}
            </span>
          </div>
          <LoadStatusBadge status={load.status} />
        </div>

        {/* Route */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="truncate">{load.pickupLocation ?? 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm pl-2">
            <span className="text-gray-400">↓</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{load.dropoffLocation ?? 'Unknown'}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
          {load.pickupDateTime && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(load.pickupDateTime)}</span>
            </div>
          )}
          {load.rate && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(load.rate)}</span>
            </div>
          )}
          {load.commodity && (
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{load.commodity}</span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {summaryBullets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">AI Summary:</p>
            {summaryBullets.map((bullet, i) => (
              <p key={i} className="text-gray-700">{bullet}</p>
            ))}
          </div>
        )}

        {/* Confidence */}
        {load.confidenceScore !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Confidence</span>
              <span className={cn(
                'font-medium',
                load.confidenceScore >= 0.8 ? 'text-green-600' :
                load.confidenceScore >= 0.5 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {Math.round(load.confidenceScore * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full confidence-bar"
                style={{
                  width: `${load.confidenceScore * 100}%`,
                  background: load.confidenceScore >= 0.8 ? '#22c55e' :
                    load.confidenceScore >= 0.5 ? '#eab308' : '#ef4444'
                }}
              />
            </div>
          </div>
        )}

        {/* Missing fields warning */}
        {load.missingFields.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-2">
            <AlertCircle className="h-3 w-3" />
            <span>Missing: {load.missingFields.slice(0, 3).join(', ')}</span>
            {load.missingFields.length > 3 && (
              <span>+{load.missingFields.length - 3}</span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400">
          Received {formatRelativeTime(load.createdAt)}
        </p>
      </CardContent>

      {/* Decision buttons */}
      {load.status === 'PENDING' && onDecision && (
        <CardFooter className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleDecision('ACCEPTED')}
            loading={deciding === 'ACCEPTED'}
            disabled={deciding !== null}
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            onClick={() => handleDecision('DENIED')}
            loading={deciding === 'DENIED'}
            disabled={deciding !== null}
          >
            <X className="h-4 w-4 mr-1" />
            Deny
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
