/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Award,
  Calendar,
  Layers,
  ArrowLeft,
  Search,
  ExternalLink
} from "lucide-react";
import { formatINR } from "../../../lib/utils";

interface CompanyStat {
  id: string;
  name: string;
  tier: string;
  count: number;
}

interface CityStat {
  city: string;
  count: number;
}

interface RecentSubmission {
  id: string;
  locationCity: string;
  locationCountry: string;
  yearsOfExperience: number;
  baseSalary: number;
  annualBonus: number | null;
  equityValueAnnual: number | null;
  totalCompensation: number;
  currency: string;
  offerDate: string;
  isVerified: boolean;
  qualityScore: number;
  createdAt: string;
  company: {
    name: string;
    tier: string;
  };
  role: {
    name: string;
    category: string;
  };
  level: {
    levelName: string;
  };
}

interface AdminData {
  totalCount: number;
  companies: CompanyStat[];
  cities: CityStat[];
  recent: RecentSubmission[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getAdminToken = () => {
    if (typeof window === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; admin_token=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
    return "";
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-token": token,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Unauthorized access. Please set a valid admin token cookie.");
        } else {
          setError("Failed to load administration dataset.");
        }
        return;
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("An unexpected error occurred while communicating with database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/compensation/${id}`, {
        method: "PATCH",
        headers: {
          "x-admin-token": token,
        },
      });

      if (!res.ok) {
        alert("Failed to update verification status.");
        return;
      }

      const updatedEntry = await res.json();
      
      // Update local state
      if (data) {
        setData({
          ...data,
          recent: data.recent.map((item) =>
            item.id === id ? { ...item, isVerified: updatedEntry.isVerified } : item
          ),
        });
      }
    } catch (err) {
      alert("Error toggling verification.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this compensation entry?")) {
      return;
    }

    setActionLoading(id);
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/compensation/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token,
        },
      });

      if (!res.ok) {
        alert("Failed to delete the entry.");
        return;
      }

      // Remove from list in state, update count
      if (data) {
        setData({
          ...data,
          totalCount: Math.max(0, data.totalCount - 1),
          recent: data.recent.filter((item) => item.id !== id),
        });
      }
    } catch (err) {
      alert("Error deleting the entry.");
    } finally {
      setActionLoading(null);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const filteredRecent = data?.recent.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.company.name.toLowerCase().includes(term) ||
      item.role.name.toLowerCase().includes(term) ||
      item.locationCity.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Control Console</h1>
              <p className="text-xs text-slate-500">Compensation Intelligence backoffice curation center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="flex items-center gap-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Public Site
            </a>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Reload Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Administration Access Error</h3>
              <p className="text-xs mt-1">{error}</p>
              <button
                onClick={() => {
                  const val = prompt("Enter ADMIN_TOKEN to authorize this session:");
                  if (val) {
                    document.cookie = `admin_token=${val}; path=/; max-age=86400`;
                    fetchAdminData();
                  }
                }}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
              >
                Authenticate Session
              </button>
            </div>
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading administrative datasets...</span>
          </div>
        )}

        {data && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Total Active Entries</span>
                  <span className="text-3xl font-extrabold font-mono mt-1 block text-indigo-600">{data.totalCount}</span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Indexed Companies</span>
                  <span className="text-3xl font-extrabold font-mono mt-1 block text-slate-800">{data.companies.length}</span>
                </div>
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Indexed Metro Hubs</span>
                  <span className="text-3xl font-extrabold font-mono mt-1 block text-teal-600">{data.cities.length}</span>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Aggregations Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Companies Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-slate-500" />
                  <h2 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Submissions by Company</h2>
                </div>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-white sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.companies.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 text-xs font-semibold text-slate-800">{c.name}</td>
                          <td className="px-6 py-3 text-[10px]">
                            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium tracking-wide">
                              {c.tier}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs font-mono text-slate-600 text-right font-bold">{c.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cities Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-slate-500" />
                  <h2 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Submissions by City</h2>
                </div>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-white sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">City Location</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.cities.map((cityObj, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 text-xs font-semibold text-slate-800">{cityObj.city}</td>
                          <td className="px-6 py-3 text-xs font-mono text-slate-600 text-right font-bold">{cityObj.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-slate-500" />
                  <div>
                    <h2 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Recent Submissions (Last 10)</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Verify or delete self-reported candidate comp packages</p>
                  </div>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recent submissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 w-full border border-slate-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredRecent && filteredRecent.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 font-medium">
                    No submissions match your query.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Detail</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience & Hub</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Breakdown (INR)</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality assessment</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRecent?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 align-top">
                          {/* Submission Details */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 block text-xs">{item.company.name}</span>
                              <span className="text-[10px] text-slate-500 block">
                                {item.role.name} • {item.level.levelName}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 block bg-slate-50 px-1.5 py-0.5 rounded-md w-max border border-slate-100">
                                ID: {item.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>

                          {/* Experience & Hub */}
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-xs">
                              <div className="font-medium text-slate-700">{item.yearsOfExperience} YOE</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {item.locationCity}
                              </div>
                              <div className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 w-max">
                                {item.offerDate}
                              </div>
                            </div>
                          </td>

                          {/* Breakdown */}
                          <td className="px-6 py-4">
                            <div className="space-y-1.5 font-mono text-xs text-slate-600">
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">Base:</span>
                                <span className="font-semibold text-slate-700">{formatINR(item.baseSalary)}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-[10px]">
                                <span className="text-slate-400">Bonus:</span>
                                <span>{item.annualBonus ? formatINR(item.annualBonus) : "₹0"}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-[10px]">
                                <span className="text-slate-400">Equity/yr:</span>
                                <span>{item.equityValueAnnual ? formatINR(item.equityValueAnnual) : "₹0"}</span>
                              </div>
                              <div className="flex justify-between gap-4 border-t border-slate-100 pt-1 text-slate-950 font-bold text-[11px]">
                                <span>Total:</span>
                                <span className="text-indigo-600">{formatINR(item.totalCompensation)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Quality metrics */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getQualityColor(
                                    item.qualityScore
                                  )}`}
                                >
                                  Score: {item.qualityScore}/100
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-medium">
                                {item.qualityScore >= 80 ? "Passed standard checks" : "Flagged by validation layer"}
                              </span>
                            </div>
                          </td>

                          {/* Verification Status */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  item.isVerified
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {item.isVerified ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 text-amber-600" />
                                    Pending
                                  </>
                                )}
                              </span>
                              <button
                                onClick={() => handleToggleVerify(item.id)}
                                disabled={actionLoading === item.id}
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline disabled:opacity-50 mt-1"
                              >
                                Toggle
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={actionLoading === item.id}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition disabled:opacity-50 inline-block"
                              title="Soft delete from system"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
