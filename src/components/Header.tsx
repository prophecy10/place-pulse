'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[#1c202d] bg-[#090a0f]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Icon 01: Geo-Pin with Ascending Trend Vector */}
          <div className="w-8 h-8 rounded-lg bg-[#141824] border border-[#23293d] flex items-center justify-center group-hover:border-sky-500/50 transition-colors shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3C8.686 3 6 5.686 6 9C6 13.25 12 21 12 21C12 21 18 13.25 18 9C18 5.686 15.314 3 12 3Z"
                fill="#161b29"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11.5L11 9L12.5 10.5L15.5 7"
                stroke="#f4f5f7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 7H15.5V8.5"
                stroke="#f4f5f7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-bold tracking-tight text-white">Place Pulse</span>
            <span className="hidden sm:inline-block text-xs text-slate-500 font-sans">
              Google Maps Rating History
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
