'use client';

import React, { useState } from 'react';
import { ChartPointDTO } from '@/lib/types';
import { ChevronDown, ChevronUp, Table, Download, Star, Users } from 'lucide-react';

interface HistoricalDataTableProps {
  points: ChartPointDTO[];
}

export const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ points }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedPoints = [...points].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Rating', 'Review_Count', 'Source'];
    const rows = sortedPoints.map((p) => [
      `"${p.label}"`,
      p.rating.toFixed(1),
      p.reviewCount,
      `"${p.source}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `place-pulse-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full panel p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="p-2 rounded-lg bg-[#141824] border border-[#23293d] text-slate-300 group-hover:text-white transition-colors">
            <Table className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-sky-300 transition-colors">
                Raw Data Table
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#171a24] text-slate-400 border border-[#212638]">
                {points.length} records
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect snapshot observations verifying chart points
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {isOpen && points.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#23293d] text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#23293d] text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Toggle data table"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-[#1d212d]">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>Unaltered observations:</span>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="hover:text-sky-300 font-mono text-[11px] underline"
            >
              Order: {sortOrder === 'desc' ? 'Newest first' : 'Earliest first'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#1d212d] bg-[#0c0e15]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#121520] text-slate-400 font-mono text-[11px] tracking-wider border-b border-[#1d212d]">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4">Date</th>
                  <th className="py-2.5 px-3 sm:px-4">Rating</th>
                  <th className="py-2.5 px-3 sm:px-4">Review Count</th>
                  <th className="py-2.5 px-3 sm:px-4">Period Change</th>
                  <th className="py-2.5 px-3 sm:px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c28] font-mono text-xs">
                {sortedPoints.map((point, index) => {
                  const nextPoint = sortedPoints[index + 1];
                  const diffReviews =
                    nextPoint && sortOrder === 'desc'
                      ? point.reviewCount - nextPoint.reviewCount
                      : nextPoint && sortOrder === 'asc'
                      ? nextPoint.reviewCount - point.reviewCount
                      : null;

                  return (
                    <tr
                      key={point.date + index}
                      className="hover:bg-[#131724] transition-colors"
                    >
                      <td className="py-2.5 px-3 sm:px-4 text-slate-300 font-sans">
                        {point.label}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {point.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-white font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-500" />
                          {point.reviewCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-slate-400">
                        {diffReviews !== null ? (
                          <span className={diffReviews > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                            {diffReviews > 0 ? `+${diffReviews.toLocaleString()}` : `${diffReviews}`}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-4 text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-[#151824] border border-[#202538] text-[10px]">
                          {point.source === 'GOOGLE_INSIGHTS' ? 'Google Places Insights' : 'Place Pulse'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
