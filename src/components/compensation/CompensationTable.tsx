/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, ShieldCheck, HelpCircle } from "lucide-react";
import { CompensationEntryWithRelations } from "../../lib/types";

interface CompensationTableProps {
  entries: CompensationEntryWithRelations[];
  p25: number;
  p75: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

type SortField = "company" | "role" | "level" | "city" | "yoe" | "base" | "bonus" | "equity" | "total" | "date";
type SortDirection = "asc" | "desc";

export const CompensationTable: React.FC<CompensationTableProps> = ({
  entries,
  p25,
  p75,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const formatINR = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return "₹0";
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Perform client-side sorting of the current page's entries
  const sortedEntries = [...entries].sort((a, b) => {
    let aVal: any = 0;
    let bVal: any = 0;

    switch (sortField) {
      case "company":
        aVal = a.company?.name || "";
        bVal = b.company?.name || "";
        break;
      case "role":
        aVal = a.role?.name || "";
        bVal = b.role?.name || "";
        break;
      case "level":
        aVal = a.level?.levelName || "";
        bVal = b.level?.levelName || "";
        break;
      case "city":
        aVal = a.locationCity || "";
        bVal = b.locationCity || "";
        break;
      case "yoe":
        aVal = a.yearsOfExperience || 0;
        bVal = b.yearsOfExperience || 0;
        break;
      case "base":
        aVal = a.baseSalary || 0;
        bVal = b.baseSalary || 0;
        break;
      case "bonus":
        aVal = a.annualBonus || 0;
        bVal = b.annualBonus || 0;
        break;
      case "equity":
        aVal = a.equityValueAnnual || 0;
        bVal = b.equityValueAnnual || 0;
        break;
      case "total":
        aVal = a.totalCompensation || 0;
        bVal = b.totalCompensation || 0;
        break;
      case "date":
        aVal = a.offerDate || "";
        bVal = b.offerDate || "";
        break;
    }

    if (typeof aVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
  });

  const getCompColorClass = (total: number) => {
    if (total >= p75 && p75 > 0) {
      return "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100";
    }
    if (total < p25 && p25 > 0) {
      return "bg-slate-50 text-slate-500 font-medium border border-slate-100";
    }
    return "bg-amber-50 text-amber-700 font-semibold border border-amber-100";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 font-bold text-slate-500 border-b border-slate-100 select-none">
              <th onClick={() => handleSort("company")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                <div className="flex items-center gap-1.5">Company <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("role")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                <div className="flex items-center gap-1.5">Role <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("level")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                <div className="flex items-center gap-1.5">Level <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("city")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition">
                <div className="flex items-center gap-1.5">City <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("yoe")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-center">
                <div className="flex items-center justify-center gap-1.5">YOE <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("base")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right">
                <div className="flex items-center justify-end gap-1.5">Base <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("bonus")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right">
                <div className="flex items-center justify-end gap-1.5">Bonus <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("equity")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right">
                <div className="flex items-center justify-end gap-1.5">Equity <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("total")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-right">
                <div className="flex items-center justify-end gap-1.5 text-slate-800">Total Comp <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th onClick={() => handleSort("date")} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition text-center">
                <div className="flex items-center justify-center gap-1.5">Date <ArrowUpDown className="h-3 w-3" /></div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-600">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={10} className="py-4 px-4">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 px-4 text-center text-slate-400 font-semibold text-sm">
                  No data matches your filters. Be the first to submit.
                </td>
              </tr>
            ) : (
              sortedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/55 transition-colors">
                  {/* Company */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    {entry.company?.logoUrl ? (
                      <img
                        src={entry.company.logoUrl}
                        alt=""
                        className="h-4 w-4 rounded-sm object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    {entry.company?.name}
                    {entry.isVerified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 inline" aria-label="Verified compensation record" />
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{entry.role?.name}</td>

                  {/* Level */}
                  <td className="py-3.5 px-4 font-mono text-slate-500 font-semibold">{entry.level?.levelName}</td>

                  {/* City */}
                  <td className="py-3.5 px-4">{entry.locationCity}</td>

                  {/* YOE */}
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">{entry.yearsOfExperience} yrs</td>

                  {/* Base */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium">{formatINR(entry.baseSalary)}</td>

                  {/* Bonus */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {entry.annualBonus ? formatINR(entry.annualBonus) : "-"}
                  </td>

                  {/* Equity */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {entry.equityValueAnnual ? formatINR(entry.equityValueAnnual) : "-"}
                  </td>

                  {/* Total Comp */}
                  <td className="py-3.5 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono ${getCompColorClass(entry.totalCompensation)}`}>
                      {formatINR(entry.totalCompensation)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-semibold">{entry.offerDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-700">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-700">{totalPages}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="flex items-center gap-1 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="flex items-center gap-1 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
