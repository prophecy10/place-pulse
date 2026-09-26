'use client';

import React from 'react';
import { ShieldCheck, Info, Database, Compass, AlertCircle } from 'lucide-react';

export const DataSourcesNotice: React.FC = () => {
  return (
    <div id="methodology" className="w-full panel p-5 sm:p-7 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-sky-400" />
        <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
          Data Integrity and Methodology
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
        {/* Source Attribution */}
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold text-sky-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Clear Source Attribution</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Every observation is tagged with its source:
          </p>
          <ul className="space-y-1.5 text-slate-400">
            <li>
              <strong className="text-slate-200">Google Places Insights:</strong> when provided directly by official Google enterprise services.
            </li>
            <li>
              <strong className="text-slate-200">Place Pulse:</strong> snapshots recorded over time in our local ledger.
            </li>
          </ul>
        </div>

        {/* Anti-Fabrication */}
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero Synthetic Data</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            We never guess missing numbers or smooth curves:
          </p>
          <ul className="space-y-1.5 text-slate-400">
            <li>&bull; Missing ratings or reviews are never invented.</li>
            <li>&bull; No artificial curve smoothing or polynomial curves.</li>
            <li>&bull; If a range lacks data, we state &quot;Not enough historical data.&quot;</li>
          </ul>
        </div>

        {/* Factual */}
        <div className="p-4 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Objective Observations</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Place Pulse does not tell you if a restaurant is good or bad, and does not create subjective AI scores. We display mathematical rating changes and review counts so you can draw your own conclusions.
          </p>
        </div>
      </div>

      {/* Official API boundary note */}
      <div className="mt-4 p-3.5 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex items-start gap-2.5 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-300">Official API Note: </span>
          Google does not currently provide historical star-distribution data (1-star through 5-star counts over time) through the public Places API. Because we do not fabricate estimates, star breakdowns are not displayed.
        </div>
      </div>
    </div>
  );
};
