/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "../../../components/layout/Header";
import { Footer } from "../../../components/layout/Footer";
import { CompareSlot } from "../../../components/compensation/CompareSlot";
import { CompanyDTO } from "../../../lib/types";
import { ArrowLeftRight, TrendingUp, HelpCircle, Sparkles } from "lucide-react";

interface CompareSlotData {
  company_id: string;
  role_category: string;
  level_id: string;
  location_city: string;
}

interface ComparisonResult {
  slot_a: {
    label: string;
    stats: {
      median_base: number;
      median_total: number;
      p25: number;
      p75: number;
      sample_count: number;
    };
  };
  slot_b: {
    label: string;
    stats: {
      median_base: number;
      median_total: number;
      p25: number;
      p75: number;
      sample_count: number;
    };
  };
  delta: {
    base_diff: number;
    base_diff_pct: number;
    total_diff: number;
    total_diff_pct: number;
  };
}

export default function ComparePublic() {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Slot states
  const [slotA, setSlotA] = useState<CompareSlotData>({
    company_id: "",
    role_category: "ENGINEERING",
    level_id: "",
    location_city: "",
  });

  const [slotB, setSlotB] = useState<CompareSlotData>({
    company_id: "",
    role_category: "ENGINEERING",
    level_id: "",
    location_city: "",
  });

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch company metadata
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        const json = await res.json();
        setCompanies(json.data || []);
        
        if (json.data && json.data.length > 0) {
          // Initialize slots with different companies if possible
          setSlotA((prev) => ({ ...prev, company_id: json.data[0].id }));
          setSlotB((prev) => ({
            ...prev,
            company_id: json.data[1]?.id || json.data[0].id,
          }));
        }
      } catch (e) {
        console.error("Failed to load compare companies metadata:", e);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    loadCompanies();
  }, []);

  const handleCompare = async () => {
    setErrorMessage("");
    setResult(null);

    if (!slotA.company_id || !slotA.level_id) {
      setErrorMessage("Please select a company and level for Slot A");
      return;
    }
    if (!slotB.company_id || !slotB.level_id) {
      setErrorMessage("Please select a company and level for Slot B");
      return;
    }

    setIsComparing(true);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_a: {
            company_id: slotA.company_id,
            level_id: slotA.level_id,
            location_city: slotA.location_city || undefined,
          },
          slot_b: {
            company_id: slotB.company_id,
            level_id: slotB.level_id,
            location_city: slotB.location_city || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process comparison request");
      }

      const json = await response.json();
      setResult(json);
    } catch (e: any) {
      setErrorMessage(e.message || "Something went wrong. Please check your selections.");
    } finally {
      setIsComparing(false);
    }
  };

  const formatLakhs = (val: number) => {
    if (val === 0) return "₹0";
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Side-by-Side Compensation Compare
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Analyze level adjustments, location parity, and base-to-total splits across tech positions
          </p>
        </div>

        {/* Two-Panel Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Panel A */}
          <CompareSlot
            label="Position A (Benchmark)"
            companies={companies}
            selectedCompanyId={slotA.company_id}
            onCompanyChange={(id) => setSlotA((prev) => ({ ...prev, company_id: id }))}
            selectedRoleCategory={slotA.role_category}
            onRoleCategoryChange={(cat) => setSlotA((prev) => ({ ...prev, role_category: cat }))}
            selectedLevelId={slotA.level_id}
            onLevelChange={(id) => setSlotA((prev) => ({ ...prev, level_id: id }))}
            locationCity={slotA.location_city}
            onCityChange={(city) => setSlotA((prev) => ({ ...prev, location_city: city }))}
          />

          {/* Panel B */}
          <CompareSlot
            label="Position B (Target Comparison)"
            companies={companies}
            selectedCompanyId={slotB.company_id}
            onCompanyChange={(id) => setSlotB((prev) => ({ ...prev, company_id: id }))}
            selectedRoleCategory={slotB.role_category}
            onRoleCategoryChange={(cat) => setSlotB((prev) => ({ ...prev, role_category: cat }))}
            selectedLevelId={slotB.level_id}
            onLevelChange={(id) => setSlotB((prev) => ({ ...prev, level_id: id }))}
            locationCity={slotB.location_city}
            onCityChange={(city) => setSlotB((prev) => ({ ...prev, location_city: city }))}
          />
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Trigger Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={isComparing || isLoadingMetadata}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-xl transition flex items-center gap-3 shadow-md hover:shadow-lg transform active:scale-95 disabled:opacity-50"
          >
            <ArrowLeftRight className="h-4 w-4" />
            {isComparing ? "Analyzing Market Splits..." : "Compare Packages"}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8 animate-fade-in">
            {/* Header Delta summary block */}
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-md font-bold text-slate-800">Comparison Intelligence Outcome</h2>
                <p className="text-xs text-slate-500 font-medium">Statistical analysis computed using live market benchmarks</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-lg flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {result.delta.total_diff_pct > 0 ? (
                    <>
                      {result.slot_b.label} pays <span className="text-emerald-600 font-extrabold font-mono">+{result.delta.total_diff_pct}%</span> more in Total Comp
                    </>
                  ) : result.delta.total_diff_pct < 0 ? (
                    <>
                      {result.slot_a.label} pays <span className="text-rose-600 font-extrabold font-mono">+{Math.abs(result.delta.total_diff_pct)}%</span> more in Total Comp
                    </>
                  ) : (
                    "Total compensation structures match identically"
                  )}
                </span>
              </div>
            </div>

            {/* Side-By-Side Aggregate Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Slot A Stats */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Benchmark</span>
                  <h4 className="text-md font-bold text-slate-800">{result.slot_a.label}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Median Total</span>
                    <span className="text-md font-bold font-mono text-slate-800">{formatLakhs(result.slot_a.stats.median_total)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Median Base</span>
                    <span className="text-md font-bold font-mono text-slate-800">{formatLakhs(result.slot_a.stats.median_base)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Interquartile Range</span>
                    <span className="text-[11px] font-bold font-mono text-slate-700">
                      {formatLakhs(result.slot_a.stats.p25)} - {formatLakhs(result.slot_a.stats.p75)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sample size</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{result.slot_a.stats.sample_count} submissions</span>
                  </div>
                </div>
              </div>

              {/* Slot B Stats */}
              <div className="space-y-4 md:pl-8 pt-6 md:pt-0">
                <div>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Comparison</span>
                  <h4 className="text-md font-bold text-slate-800">{result.slot_b.label}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Median Total</span>
                    <span className="text-md font-bold font-mono text-slate-800">{formatLakhs(result.slot_b.stats.median_total)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Median Base</span>
                    <span className="text-md font-bold font-mono text-slate-800">{formatLakhs(result.slot_b.stats.median_base)}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Interquartile Range</span>
                    <span className="text-[11px] font-bold font-mono text-slate-700">
                      {formatLakhs(result.slot_b.stats.p25)} - {formatLakhs(result.slot_b.stats.p75)}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Sample size</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{result.slot_b.stats.sample_count} submissions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple CSS Visualization Bars */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Split Distribution</h4>
              
              <div className="space-y-6">
                {/* Total Compensation comparison bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Median Total Compensation</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{result.slot_a.label}</span>
                        <span>{formatLakhs(result.slot_a.stats.median_total)}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-slate-400 rounded-md transition-all"
                          style={{
                            width: `${
                              result.slot_a.stats.median_total || result.slot_b.stats.median_total
                                ? (result.slot_a.stats.median_total /
                                    Math.max(result.slot_a.stats.median_total, result.slot_b.stats.median_total)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-indigo-500">
                        <span>{result.slot_b.label}</span>
                        <span>{formatLakhs(result.slot_b.stats.median_total)}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-indigo-600 rounded-md transition-all"
                          style={{
                            width: `${
                              result.slot_a.stats.median_total || result.slot_b.stats.median_total
                                ? (result.slot_b.stats.median_total /
                                    Math.max(result.slot_a.stats.median_total, result.slot_b.stats.median_total)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Salary comparison bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Median Base Salary</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{result.slot_a.label}</span>
                        <span>{formatLakhs(result.slot_a.stats.median_base)}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-slate-300 rounded-md transition-all"
                          style={{
                            width: `${
                              result.slot_a.stats.median_base || result.slot_b.stats.median_base
                                ? (result.slot_a.stats.median_base /
                                    Math.max(result.slot_a.stats.median_base, result.slot_b.stats.median_base)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-600">
                        <span>{result.slot_b.label}</span>
                        <span>{formatLakhs(result.slot_b.stats.median_base)}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-emerald-500 rounded-md transition-all"
                          style={{
                            width: `${
                              result.slot_a.stats.median_base || result.slot_b.stats.median_base
                                ? (result.slot_b.stats.median_base /
                                    Math.max(result.slot_a.stats.median_base, result.slot_b.stats.median_base)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
