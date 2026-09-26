'use client';

import React, { useState } from 'react';
import { PlaceDTO, PlaceMetricsDTO } from '@/lib/types';
import { Star, MapPin, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PlaceHeaderProps {
  place: PlaceDTO;
  metrics: PlaceMetricsDTO | null;
  onRefreshSnapshot?: () => Promise<void>;
}

export const PlaceHeader: React.FC<PlaceHeaderProps> = ({
  place,
  metrics,
  onRefreshSnapshot,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const handleSnapshotClick = async () => {
    if (!onRefreshSnapshot || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefreshSnapshot();
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedTrackingDate = metrics?.trackingSince
    ? new Date(metrics.trackingSince).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full panel p-5 sm:p-7 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left Column: Place Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            {place.category && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#161a26] text-sky-300 border border-[#23293d] uppercase tracking-wider">
                {place.category}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-400 bg-[#14161f] border border-[#1e2230]">
              ID: {place.googlePlaceId.substring(0, 14)}...
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 break-words">
            {place.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs sm:text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-300">{place.address}</span>
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 ml-1 font-medium transition-colors"
            >
              <span>View on Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {formattedTrackingDate && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span>First tracked: <span className="text-slate-300">{formattedTrackingDate}</span></span>
              <span className="text-slate-600">&bull;</span>
              <span>
                {metrics?.dataPointsCount ?? 1} snapshot{metrics?.dataPointsCount === 1 ? '' : 's'} in ledger
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Key Stats & Refresh Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1d212d]">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            {/* Current Rating */}
            <div className="panel-subtle p-3.5 min-w-[130px]">
              <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Google Rating</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono flex items-baseline gap-1">
                <span>{place.currentRating.toFixed(1)}</span>
                <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
              </div>
            </div>

            {/* Current Review Count */}
            <div className="panel-subtle p-3.5 min-w-[140px]">
              <div className="text-[11px] font-medium text-slate-400 mb-1">
                Total Reviews
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-sky-400 font-mono">
                {place.currentReviewCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Record Snapshot Button */}
          {onRefreshSnapshot && (
            <button
              type="button"
              onClick={handleSnapshotClick}
              disabled={isRefreshing}
              className="px-3.5 py-3 rounded-lg border border-[#23293d] bg-[#141824] hover:bg-[#1a2030] text-slate-300 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs font-medium"
              title="Capture a new snapshot today"
            >
              {snapshotSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Snapshot Recorded</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Update Snapshot</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
