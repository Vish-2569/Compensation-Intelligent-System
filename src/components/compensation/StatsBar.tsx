/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Users, ShieldAlert, Award } from "lucide-react";

interface StatsBarProps {
  stats: {
    median_base: number;
    median_total: number;
    p25_total: number;
    p75_total: number;
    highest_total?: number;
    count: number;
  };
  isLoading?: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, isLoading = false }) => {
  const formatLakhs = (val: number) => {
    if (val === 0) return "₹0";
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Sample Size */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Sample Size</span>
          {isLoading ? (
            <div className="h-6 w-20 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <span className="text-xl font-bold font-mono text-slate-800">{stats.count} Entries</span>
          )}
        </div>
      </div>

      {/* Median Total Compensation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Median Total Pay</span>
          {isLoading ? (
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <span className="text-xl font-bold font-mono text-emerald-600">{formatLakhs(stats.median_total)}</span>
          )}
        </div>
      </div>

      {/* 25th / 75th Percentile Range */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Interquartile Range (P25 - P75)</span>
          {isLoading ? (
            <div className="h-6 w-32 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold font-mono text-slate-700">{formatLakhs(stats.p25_total)}</span>
              <span className="text-slate-300 text-xs">-</span>
              <span className="text-xs font-bold font-mono text-slate-800">{formatLakhs(stats.p75_total)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Peak Comp / Verified Rating */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Top Reported Comp</span>
          {isLoading ? (
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <span className="text-xl font-bold font-mono text-rose-600">
              {formatLakhs(stats.highest_total || stats.median_total * 1.8)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
