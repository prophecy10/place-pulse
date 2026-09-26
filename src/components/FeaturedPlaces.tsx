'use client';

import React, { useEffect, useState } from 'react';
import { Star, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';

interface FeaturedPlaceItem {
  id: string;
  name: string;
  address: string;
  category: string | null;
  rating: number;
  reviewCount: number;
  snapshotCount: number;
  oneYearDelta: number | null;
}

interface FeaturedPlacesProps {
  onSelectPlace: (query: string) => void;
}

export const FeaturedPlaces: React.FC<FeaturedPlacesProps> = ({ onSelectPlace }) => {
  const [places, setPlaces] = useState<FeaturedPlaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch('/api/places/featured');
        if (res.ok) {
          const data = await res.json();
          if (data.places) {
            setPlaces(data.places);
          }
        }
      } catch (e) {
        console.warn('Could not load featured places:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

  if (isLoading && places.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 text-left">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1d212d]">
        <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
          Sample Tracked Places
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Click to inspect rating history
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => onSelectPlace(place.name)}
            className="p-3.5 rounded-lg bg-[#11131a] hover:bg-[#151822] border border-[#1d212d] hover:border-[#2a3144] text-left transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors truncate">
                  {place.name}
                </span>
                <span className="shrink-0 text-xs font-mono font-medium text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {place.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mb-2.5">{place.address}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#181c28] font-mono">
              <span className="text-slate-400 text-[11px]">
                {place.reviewCount.toLocaleString()} reviews
              </span>

              {place.oneYearDelta !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    place.oneYearDelta > 0
                      ? 'text-emerald-400'
                      : place.oneYearDelta < 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {place.oneYearDelta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : place.oneYearDelta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {place.oneYearDelta > 0 ? `+${place.oneYearDelta}` : place.oneYearDelta} (1Y)
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">{place.snapshotCount} snapshots</span>
              )}

              <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-sans text-xs">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
