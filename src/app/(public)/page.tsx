/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { StatsBar } from "../../components/compensation/StatsBar";
import { CompensationTable } from "../../components/compensation/CompensationTable";
import { Select } from "../../components/ui/Select";
import { Slider } from "../../components/ui/Slider";
import { CompanyDTO, LevelDTO, RoleDTO, CompensationEntryWithRelations } from "../../lib/types";
import { Search, RotateCcw, Filter, Building2, Briefcase, Award } from "lucide-react";

export default function HomePublic() {
  const [entries, setEntries] = useState<CompensationEntryWithRelations[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [roles, setRoles] = useState<Record<string, RoleDTO[]>>({});
  const [levels, setLevels] = useState<LevelDTO[]>([]);

  // Search filter states
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedRoleCategory, setSelectedRoleCategory] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [yoeRange, setYoeRange] = useState<[number, number]>([0, 20]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Stats bar state
  const [stats, setStats] = useState({
    median_base: 0,
    median_total: 0,
    p25_total: 0,
    p75_total: 0,
    highest_total: 0,
    count: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Form selections and data helper categories
  const citiesList = [
    { value: "Bangalore", label: "Bangalore" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Pune", label: "Pune" },
    { value: "Chennai", label: "Chennai" },
    { value: "Delhi NCR", label: "Delhi NCR" },
    { value: "Remote", label: "Remote" },
  ];

  const roleCategories = [
    { value: "ENGINEERING", label: "Software Engineering" },
    { value: "PRODUCT", label: "Product Management" },
    { value: "DESIGN", label: "Product Design" },
    { value: "DATA", label: "Data Science" },
    { value: "MANAGEMENT", label: "Management" },
    { value: "OTHER", label: "Other" },
  ];

  // Fetch initial parameters
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [companiesRes, rolesRes] = await Promise.all([
          fetch("/api/companies"),
          fetch("/api/roles"),
        ]);
        const companiesJson = await companiesRes.json();
        const rolesJson = await rolesRes.json();

        setCompanies(companiesJson.data || []);
        setRoles(rolesJson.data || {});
      } catch (e) {
        console.error("Failed to load search form metadata:", e);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch levels dynamically when company or role category changes
  useEffect(() => {
    const fetchLevels = async () => {
      if (!selectedCompanyId) {
        setLevels([]);
        setSelectedLevelId("");
        return;
      }

      try {
        let url = `/api/levels?company_id=${selectedCompanyId}`;
        if (selectedRoleCategory) {
          url += `&role_category=${selectedRoleCategory}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setLevels(json.data || []);
        
        // Reset level selection if the existing level is not valid anymore
        if (selectedLevelId && !json.data?.some((l: any) => l.id === selectedLevelId)) {
          setSelectedLevelId("");
        }
      } catch (e) {
        console.error("Failed to load levels dynamic dropdown:", e);
      }
    };
    fetchLevels();
  }, [selectedCompanyId, selectedRoleCategory]);

  // Master fetch query for compensation dataset
  const fetchCompensations = useCallback(async (pageToLoad = 1) => {
    setIsSearching(true);
    try {
      let queryParams = new URLSearchParams();
      if (selectedCompanyId) queryParams.append("company_id", selectedCompanyId);
      if (selectedLevelId) queryParams.append("level_id", selectedLevelId);
      if (selectedRoleCategory) queryParams.append("role_category", selectedRoleCategory);
      if (selectedCity) queryParams.append("location_city", selectedCity);
      
      queryParams.append("min_yoe", String(yoeRange[0]));
      queryParams.append("max_yoe", String(yoeRange[1]));
      queryParams.append("page", String(pageToLoad));
      queryParams.append("limit", String(limit));
      queryParams.append("location_country", "India");

      const response = await fetch(`/api/compensation?${queryParams.toString()}`);
      const json = await response.json();

      if (json.data) {
        setEntries(json.data);
        setStats(json.meta.stats);
        setCurrentPage(json.meta.page);
        setTotalPages(Math.ceil(json.meta.total / limit));
      }
    } catch (e) {
      console.error("Failed to search compensation matrix:", e);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [selectedCompanyId, selectedLevelId, selectedRoleCategory, selectedCity, yoeRange, limit]);

  // Trigger search on component mount
  useEffect(() => {
    fetchCompensations(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompensations(1);
  };

  const handleResetFilters = () => {
    setSelectedCompanyId("");
    setSelectedRoleCategory("");
    setSelectedLevelId("");
    setSelectedCity("");
    setYoeRange([0, 20]);
    setTimeout(() => {
      fetchCompensations(1);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Simple title panel - Avoid pseudo-intellectual name as requested */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Compensation Intelligence Platform
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified salaries, bonuses, and equity structures from tech companies operating in India
          </p>
        </div>

        {/* Stats Summary Bar */}
        <StatsBar stats={stats} isLoading={isLoading} />

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Filter className="h-4 w-4 text-indigo-600" />
                <span>Dataset Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Company Selection */}
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-slate-400 shrink-0 mt-6" />
                <Select
                  label="Company"
                  placeholder="All Companies..."
                  value={selectedCompanyId}
                  onChange={setSelectedCompanyId}
                  options={companies.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>

              {/* Role Category */}
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 shrink-0 mt-6" />
                <Select
                  label="Role Category"
                  placeholder="All Categories..."
                  value={selectedRoleCategory}
                  onChange={setSelectedRoleCategory}
                  options={roleCategories}
                />
              </div>

              {/* Dynamic Level */}
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-slate-400 shrink-0 mt-6" />
                <Select
                  label="Standard Level"
                  placeholder={selectedCompanyId ? "All Levels..." : "Select company first..."}
                  value={selectedLevelId}
                  onChange={setSelectedLevelId}
                  options={levels.map((l) => ({ value: l.id, label: l.levelName }))}
                  disabled={!selectedCompanyId}
                />
              </div>

              {/* City Selection */}
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-slate-400 shrink-0 mt-6 flex items-center justify-center font-bold text-xs">📍</div>
                <Select
                  label="City"
                  placeholder="All Cities..."
                  value={selectedCity}
                  onChange={setSelectedCity}
                  options={citiesList}
                />
              </div>
            </div>

            {/* Range Slider for Experience */}
            <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-1/2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Years of Experience Range
                </label>
                <Slider
                  min={0}
                  max={20}
                  value={yoeRange}
                  onChange={setYoeRange}
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full md:w-auto bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs tracking-wider px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shrink-0 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Apply Filters"}
              </button>
            </div>
          </form>
        </div>

        {/* Results Matrix Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Compensation Entries ({stats.count})
            </span>
          </div>

          <CompensationTable
            entries={entries}
            p25={stats.p25_total}
            p75={stats.p75_total}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchCompensations}
            isLoading={isLoading || isSearching}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
