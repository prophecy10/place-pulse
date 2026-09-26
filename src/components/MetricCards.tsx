'use client';

import React from 'react';
import { PlaceMetricsDTO } from '@/lib/types';
import { TrendingDown, TrendingUp, Minus, Activity, ArrowRight, Gauge } from 'lucide-react';

interface MetricCardsProps {
  metrics: PlaceMetricsDTO;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const periods = [
    { key: '1M', label: '1 Month' },
    { key: '3M', label: '3 Months' },
    { key: '6M', label: '6 Months' },
    { key: '1Y', label: '1 Year' },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 1. Rating Change Section */}
      <div className="panel p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1d212d] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#161a24] text-amber-400 border border-[#222838]">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Rating Change
              </h3>
              <p className="text-xs text-slate-400">
                Difference between earliest and latest snapshot
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {periods.map(({ key, label }) => {
            const data = metrics.metricsByRange[key];
            const isAvail = data && data.available && data.deltaRating !== null;
            const delta = data?.deltaRating ?? 0;

            return (
              <div
                key={key}
                className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-medium text-slate-300">{label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171a24] text-slate-400 font-mono">
                    {key}
                  </span>
                </div>

                {isAvail ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mb-1">
                      <span>{data.startRating?.toFixed(1)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="font-bold text-slate-200">{data.endRating?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Change:</span>
                      <span
                        className={`font-mono text-sm sm:text-base font-bold flex items-center gap-0.5 ${
                          delta > 0
                            ? 'text-emerald-400'
                            : delta < 0
                            ? 'text-rose-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {delta > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : delta < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-500 font-mono">
                    Not enough historical data.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Review Growth & Velocity Section */}
      <div className="panel p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1d212d] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#141a26] text-sky-400 border border-[#1f283d]">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Review Count Growth
              </h3>
              <p className="text-xs text-slate-400">
                Total review count increase across recorded snapshots
              </p>
            </div>
          </div>
          {metrics.reviewVelocity.averagePerMonth !== null && (
            <div className="text-right">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#131926] text-sky-400 border border-[#1f283d] font-medium">
                +{metrics.reviewVelocity.averagePerMonth.toLocaleString()} / mo
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {periods.map(({ key, label }) => {
            const data = metrics.metricsByRange[key];
            const isAvail = data && data.available && data.deltaReviews !== null;
            const delta = data?.deltaReviews ?? 0;

            return (
              <div
                key={key}
                className="p-3.5 rounded-lg bg-[#0e1017] border border-[#1b1f2b] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-medium text-slate-300">{label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171a24] text-slate-400 font-mono">
                    {key}
                  </span>
                </div>

                {isAvail ? (
                  <div>
                    <div className="text-xs text-slate-400 mb-1 font-mono">
                      <span>{data.startReviews?.toLocaleString()}</span>
                      <span className="text-slate-600 mx-1">&rarr;</span>
                      <span className="text-slate-200">{data.endReviews?.toLocaleString()}</span>
                    </div>
                    <div className="font-mono text-sm sm:text-base font-bold text-sky-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{delta >= 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()} reviews</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-slate-500 font-mono">
                    Not enough historical data.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
