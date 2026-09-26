'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartPointDTO, TimeRange } from '@/lib/types';
import { TrendingDown, TrendingUp, Minus, Calendar, Database, Maximize2, Minimize2 } from 'lucide-react';

interface RatingChartProps {
  points: ChartPointDTO[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  notice?: string;
  sourceLabel: string;
  isSingleSnapshot: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', '2Y', 'MAX'];

export const RatingChart: React.FC<RatingChartProps> = ({
  points,
  selectedRange,
  onRangeChange,
  notice,
  sourceLabel,
  isSingleSnapshot,
  isExpanded = false,
  onToggleExpand,
}) => {
  const ratings = points.map((p) => p.rating);
  const minRating = ratings.length > 0 ? Math.min(...ratings) : 4.0;
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 5.0;
  const yMin = Math.max(1.0, Number((minRating - 0.2).toFixed(1)));
  const yMax = Math.min(5.0, Number((maxRating + 0.2).toFixed(1)));

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const ratingDelta =
    firstPoint && lastPoint && points.length > 1
      ? Number((lastPoint.rating - firstPoint.rating).toFixed(1))
      : 0;

  return (
    <div className="w-full panel p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1d212d]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Google Rating Over Time
              </h2>
              {points.length > 1 && (
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-medium ${
                    ratingDelta > 0
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : ratingDelta < 0
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      : 'bg-[#181c28] text-slate-300 border border-[#262c3e]'
                  }`}
                >
                  {ratingDelta > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : ratingDelta < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {ratingDelta > 0 ? `+${ratingDelta}` : ratingDelta} ({selectedRange})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Recorded observations without smoothing
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* Time Range Selector */}
            <div className="flex items-center rounded-lg p-0.5 bg-[#0e1017] border border-[#1d212d] overflow-x-auto no-scrollbar">
              {RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => onRangeChange(range)}
                  className={`px-2 sm:px-2.5 py-0.5 rounded text-[11px] font-mono font-medium transition-colors whitespace-nowrap ${
                    selectedRange === range
                      ? 'bg-[#1e2333] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Expand / Minimize Button */}
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-[#0e1017] hover:bg-[#181c26] border border-[#1d212d] text-slate-400 hover:text-white transition-colors"
                title={isExpanded ? 'Collapse chart' : 'Expand full width'}
                aria-label={isExpanded ? 'Collapse chart' : 'Expand full width'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Truncated range notice */}
        {notice && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#141722] border border-[#202536] text-[11px] text-slate-300 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Canvas */}
        <div className={`mt-3 w-full transition-all duration-200 ${isExpanded ? 'h-[360px] sm:h-[440px]' : 'h-[250px] sm:h-[300px]'}`}>
          {isSingleSnapshot ? (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-[#0c0e15] border border-dashed border-[#1f2434] p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[#151824] border border-[#23293d] flex items-center justify-center mb-2.5 text-sky-400">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Tracking started today
              </h3>
              <p className="max-w-xs text-xs text-slate-400 leading-relaxed mb-2.5">
                Baseline recorded. Future snapshots will build the historical curve.
              </p>
              {points[0] && (
                <div className="flex flex-wrap items-center justify-center gap-2 px-2.5 py-1 rounded bg-[#141722] border border-[#1e2333] text-[11px] font-mono">
                  <span className="text-slate-400">{points[0].label}</span>
                  <span className="text-amber-400 font-bold">{points[0].rating.toFixed(1)} ★</span>
                  <span className="text-sky-400 font-bold">{points[0].reviewCount.toLocaleString()} reviews</span>
                </div>
              )}
            </div>
          ) : points.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              No historical rating points recorded for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#181c28"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1c202d' }}
                  dy={6}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[yMin, yMax]}
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#1c202d' }}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartPointDTO;
                      return (
                        <div className="chart-tooltip-container text-xs">
                          <div className="font-mono text-slate-400 mb-1 text-[10px]">
                            {data.label}
                          </div>
                          <div className="flex items-center justify-between gap-4 mb-0.5">
                            <span className="text-slate-400">Rating:</span>
                            <span className="font-bold font-mono text-amber-400">
                              {data.rating.toFixed(1)} ★
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="text-slate-400">Reviews:</span>
                            <span className="font-bold font-mono text-white">
                              {data.reviewCount.toLocaleString()}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-[#1e2333] text-[9px] text-slate-500">
                            {data.source === 'GOOGLE_INSIGHTS' ? 'Google Places Insights' : 'Place Pulse Snapshot'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="linear"
                  dataKey="rating"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#38bdf8', stroke: '#090a0f', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#7dd3fc', stroke: '#ffffff', strokeWidth: 1.5 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-[#1d212d] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span className="text-slate-300 font-medium">{sourceLabel}</span>
        </div>
        <div>
          {points.length} observation{points.length === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};
