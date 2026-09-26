'use client';

import React, { useState, useEffect } from 'react';
import { History, Star, ArrowRight, Trash2 } from 'lucide-react';

export interface RecentPlaceItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string | null;
  savedAt: string;
}

interface RecentlyViewedProps {
  onSelectPlace: (nameOrId: string) => void;
}

const STORAGE_KEY = 'place_pulse_recent_places';

export function saveRecentPlace(item: Omit<RecentPlaceItem, 'savedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentPlaceItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== item.id);
    const updated: RecentPlaceItem[] = [
      { ...item, savedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onSelectPlace }) => {
  const [recentItems, setRecentItems] = useState<RecentPlaceItem[]>([]);

  const loadItems = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setRecentItems(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  };

  useEffect(() => {
    loadItems();
    window.addEventListener('storage', loadItems);
    return () => window.removeEventListener('storage', loadItems);
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentItems([]);
  };

  if (recentItems.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 text-left">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1d212d]">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
            Recent Searches
          </h3>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            (Saved locally on your device)
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-mono"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {recentItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPlace(item.name)}
            className="p-3 rounded-lg bg-[#11131a] hover:bg-[#151822] border border-[#1d212d] hover:border-[#2a3144] text-left transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors truncate">
                  {item.name}
                </span>
                <span className="shrink-0 text-xs font-mono font-medium text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {item.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mb-2">{item.address}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-[#181c28]">
              <span>{item.reviewCount.toLocaleString()} reviews</span>
              <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
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
