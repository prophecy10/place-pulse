'use client';

import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface SearchInputProps {
  onAnalyze: (input: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  initialValue?: string;
  compact?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onAnalyze,
  isLoading,
  error,
  initialValue = '',
  compact = false,
}) => {
  const [input, setInput] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onAnalyze(input.trim());
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    onAnalyze(example);
  };

  return (
    <div className={`w-full ${compact ? 'max-w-xl' : 'max-w-2xl mx-auto'}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl sm:rounded-2xl border border-[#232838] bg-[#11131b] focus-within:border-sky-500/60 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all p-1.5 sm:p-2 shadow-lg shadow-black/40">
          <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
            <input
              id="place-url-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste Google Maps link or enter place + city..."
              disabled={isLoading}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none disabled:opacity-50"
            />
          </div>

          <button
            id="analyze-place-button"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mt-1 sm:mt-0 px-4 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span>Analyze Place</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-rose-200">{error}</p>
            <p className="mt-1 text-slate-400">
              Try searching the place name and city directly, like &quot;Saravana Bhavan Chennai&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Benchmark chips */}
      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-1">
          <span className="text-slate-500 text-[11px] font-mono shrink-0 mr-1">Examples:</span>
          <button
            type="button"
            onClick={() => handleExampleClick('Hotel Saravana Bhavan Chennai')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-[#131722] hover:bg-[#1c2233] border border-[#212738] text-slate-300 hover:text-white transition-colors shrink-0 text-xs font-mono"
          >
            Saravana Bhavan Chennai
          </button>
          <button
            type="button"
            onClick={() => handleExampleClick("Katz's Delicatessen New York")}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-[#131722] hover:bg-[#1c2233] border border-[#212738] text-slate-300 hover:text-white transition-colors shrink-0 text-xs font-mono"
          >
            Katz&apos;s Deli NYC
          </button>
          <button
            type="button"
            onClick={() => handleExampleClick('Musée du Louvre Paris')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-[#131722] hover:bg-[#1c2233] border border-[#212738] text-slate-300 hover:text-white transition-colors shrink-0 text-xs font-mono"
          >
            Louvre Museum Paris
          </button>
        </div>
      )}
    </div>
  );
};
