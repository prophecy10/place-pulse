'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SearchInput } from '@/components/SearchInput';
import { PlaceHeader } from '@/components/PlaceHeader';
import { RatingChart } from '@/components/RatingChart';
import { ReviewCountChart } from '@/components/ReviewCountChart';
import { MetricCards } from '@/components/MetricCards';
import { DataSourcesNotice } from '@/components/DataSourcesNotice';
import { RecentlyViewed, saveRecentPlace } from '@/components/RecentlyViewed';
import { FeaturedPlaces } from '@/components/FeaturedPlaces';
import { HistoryResponseDTO, PlaceDTO, PlaceMetricsDTO, TimeRange } from '@/lib/types';
import { Loader2, ArrowLeft, Search, BarChart3, Database } from 'lucide-react';

function PlacePulseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('place') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPlace, setCurrentPlace] = useState<PlaceDTO | null>(null);
  const [historyData, setHistoryData] = useState<HistoryResponseDTO | null>(null);
  const [metrics, setMetrics] = useState<PlaceMetricsDTO | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('MAX');
  const [expandedChart, setExpandedChart] = useState<'rating' | 'reviews' | null>(null);

  // Load history and metrics for a place
  const fetchPlaceData = useCallback(async (placeId: string, range: TimeRange) => {
    try {
      const [histRes, metRes] = await Promise.all([
        fetch(`/api/places/${placeId}/history?range=${range}`),
        fetch(`/api/places/${placeId}/metrics`),
      ]);

      if (!histRes.ok || !metRes.ok) {
        throw new Error('Could not retrieve analytics data.');
      }

      const histJson = await histRes.json();
      const metJson = await metRes.json();

      setHistoryData(histJson.history);
      setMetrics(metJson.metrics);
    } catch (err: unknown) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Error fetching analytics');
    }
  }, []);

  // Handle URL or query resolution
  const handleAnalyze = async (input: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/places/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not resolve this place.');
      }

      const place: PlaceDTO = data.place;
      setCurrentPlace(place);
      setSelectedRange('MAX');

      // Save to device's private local storage
      saveRecentPlace({
        id: place.id,
        name: place.name,
        address: place.address,
        rating: place.currentRating,
        reviewCount: place.currentReviewCount,
        category: place.category,
      });

      await fetchPlaceData(place.id, 'MAX');
    } catch (err: unknown) {
      console.error('Resolution failed:', err);
      setError(err instanceof Error ? err.message : 'Resolution failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Change time range filter
  const handleRangeChange = async (range: TimeRange) => {
    setSelectedRange(range);
    if (currentPlace) {
      await fetchPlaceData(currentPlace.id, range);
    }
  };

  // Record a fresh snapshot on demand
  const handleRefreshSnapshot = async () => {
    if (!currentPlace) return;
    try {
      const res = await fetch(`/api/places/${currentPlace.id}/snapshot`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchPlaceData(currentPlace.id, selectedRange);
      }
    } catch (err) {
      console.error('Error recording snapshot:', err);
    }
  };

  // Reset back to search screen
  const handleReset = () => {
    setCurrentPlace(null);
    setHistoryData(null);
    setMetrics(null);
    setError(null);
  };

  // Trigger analysis if initial query in URL
  useEffect(() => {
    if (initialQuery) {
      handleAnalyze(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* HOMEPAGE VIEW */}
        {!currentPlace && (
          <div className="flex flex-col items-center justify-center pt-6 pb-12 text-center">
            {/* Minimal Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121520] border border-[#1e2333] text-slate-400 text-xs font-mono mb-5">
              <span>Google Maps Time Series Tracker</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mb-3">
              Place Pulse
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal mb-2">
              See how a place&apos;s Google rating has changed over time.
            </p>

            <p className="text-xs sm:text-sm text-slate-500 font-mono mb-8 max-w-md">
              Google shows the current rating. Place Pulse shows how it got there.
            </p>

            {/* Input Form */}
            <SearchInput
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
            />

            {/* Recently Viewed by You (100% Private to User's Device) */}
            <RecentlyViewed onSelectPlace={handleAnalyze} />

            {/* Featured Pre-Tracked Places Directory */}
            <FeaturedPlaces onSelectPlace={handleAnalyze} />

            {/* How It Works (Minimalist 3 steps) */}
            <div className="mt-14 pt-10 border-t border-[#1a1d28] grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full text-left">
              <div className="panel-subtle p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-md bg-[#141824] border border-[#202538] flex items-center justify-center text-sky-400 mb-1">
                  <Search className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">1. Search any place</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste a Google Maps link or enter a place name and city.
                </p>
              </div>

              <div className="panel-subtle p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-md bg-[#141824] border border-[#202538] flex items-center justify-center text-sky-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">2. Inspect rating history</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  View actual recorded rating curves and review accumulation over time.
                </p>
              </div>

              <div className="panel-subtle p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-md bg-[#141824] border border-[#202538] flex items-center justify-center text-sky-400 mb-1">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white text-sm">3. Verify the records</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Check individual snapshots in the audit table with zero curve smoothing.
                </p>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="mt-10 max-w-3xl w-full">
              <DataSourcesNotice />
            </div>
          </div>
        )}

        {/* RESULT PAGE VIEW */}
        {currentPlace && (
          <div className="animate-in fade-in duration-200">
            {/* Top Bar with Back Button & Compact Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11131a] hover:bg-[#161922] border border-[#1d212d] text-xs font-medium text-slate-300 hover:text-white transition-colors self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Search another place</span>
              </button>

              <div className="w-full sm:w-auto">
                <SearchInput
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  error={error}
                  initialValue=""
                  compact={true}
                />
              </div>
            </div>

            {/* 1. Current Place Header */}
            <PlaceHeader
              place={currentPlace}
              metrics={metrics}
              onRefreshSnapshot={handleRefreshSnapshot}
            />

            {isLoading ? (
              <div className="w-full py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2.5" />
                <span className="text-xs font-mono">Loading place history...</span>
              </div>
            ) : (
              <>
                {/* 2. Side-by-Side Charts with Expand Control */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                  {historyData && (
                    <div className={expandedChart === 'rating' ? 'lg:col-span-2' : ''}>
                      <RatingChart
                        points={historyData.points}
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                        notice={historyData.notice}
                        sourceLabel={historyData.sourceInfo.displaySource}
                        isSingleSnapshot={historyData.isSingleSnapshot}
                        isExpanded={expandedChart === 'rating'}
                        onToggleExpand={() =>
                          setExpandedChart(expandedChart === 'rating' ? null : 'rating')
                        }
                      />
                    </div>
                  )}

                  {historyData && (
                    <div className={expandedChart === 'reviews' ? 'lg:col-span-2' : ''}>
                      <ReviewCountChart
                        points={historyData.points}
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                        notice={historyData.notice}
                        sourceLabel={historyData.sourceInfo.displaySource}
                        isSingleSnapshot={historyData.isSingleSnapshot}
                        isExpanded={expandedChart === 'reviews'}
                        onToggleExpand={() =>
                          setExpandedChart(expandedChart === 'reviews' ? null : 'reviews')
                        }
                      />
                    </div>
                  )}
                </div>

                {/* 4. Rating Change & Review Velocity */}
                {metrics && <MetricCards metrics={metrics} />}

                {/* 5. Methodology Notice */}
                <DataSourcesNotice />
              </>
            )}
          </div>
        )}
      </main>

      {/* Clean, Minimal Footer */}
      <footer className="border-t border-[#181b25] bg-[#08090d] py-6 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="font-mono text-slate-400 text-xs">
            Place Pulse &bull; Google Maps Rating History
          </div>
          <div>
            Built with official Google Places data. No AI summaries or synthetic ratings.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-sky-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading...
      </div>
    }>
      <PlacePulseContent />
    </Suspense>
  );
}
