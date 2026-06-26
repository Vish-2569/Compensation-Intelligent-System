/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Select } from "../ui/Select";
import { CompanyDTO, LevelDTO } from "../../lib/types";

interface CompareSlotProps {
  label: string;
  companies: CompanyDTO[];
  selectedCompanyId: string;
  onCompanyChange: (id: string) => void;
  selectedRoleCategory: string;
  onRoleCategoryChange: (category: string) => void;
  selectedLevelId: string;
  onLevelChange: (id: string) => void;
  locationCity: string;
  onCityChange: (city: string) => void;
  id?: string;
}

export const CompareSlot: React.FC<CompareSlotProps> = ({
  label,
  companies,
  selectedCompanyId,
  onCompanyChange,
  selectedRoleCategory,
  onRoleCategoryChange,
  selectedLevelId,
  onLevelChange,
  locationCity,
  onCityChange,
  id,
}) => {
  const [levels, setLevels] = useState<LevelDTO[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);

  const roleCategories = [
    { value: "ENGINEERING", label: "Software Engineering" },
    { value: "PRODUCT", label: "Product Management" },
    { value: "DESIGN", label: "Product Design" },
    { value: "DATA", label: "Data Science" },
    { value: "MANAGEMENT", label: "Management" },
    { value: "OTHER", label: "Other" },
  ];

  const cities = [
    { value: "Bangalore", label: "Bangalore" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "Hyderabad", label: "Hyderabad" },
    { value: "Pune", label: "Pune" },
    { value: "Chennai", label: "Chennai" },
    { value: "Delhi NCR", label: "Delhi NCR" },
    { value: "Remote", label: "Remote" },
  ];

  // Fetch levels dynamically based on selected company & role category
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchLevels = async () => {
      setIsLoadingLevels(true);
      try {
        let url = `/api/levels?company_id=${selectedCompanyId}`;
        if (selectedRoleCategory) {
          url += `&role_category=${selectedRoleCategory}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setLevels(json.data || []);
        
        // Auto-select first level if currently selected one is not valid for this new company/category
        const validLevelExists = json.data?.some((l: any) => l.id === selectedLevelId);
        if (json.data && json.data.length > 0 && !validLevelExists) {
          onLevelChange(json.data[0].id);
        }
      } catch (e) {
        console.error("Error loading levels in comparison panel:", e);
      } finally {
        setIsLoadingLevels(false);
      }
    };

    fetchLevels();
  }, [selectedCompanyId, selectedRoleCategory]);

  return (
    <div id={id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
        {label}
      </h3>

      {/* Company Selection */}
      <Select
        label="Company"
        placeholder="Select Company..."
        value={selectedCompanyId}
        onChange={onCompanyChange}
        options={companies.map((c) => ({ value: c.id, label: c.name }))}
      />

      {/* Role Category Selection */}
      <Select
        label="Role Category"
        placeholder="Select Category..."
        value={selectedRoleCategory}
        onChange={onRoleCategoryChange}
        options={roleCategories}
      />

      {/* Level Selection (Dynamic) */}
      <Select
        label="Level"
        placeholder={isLoadingLevels ? "Loading..." : "Select Level..."}
        value={selectedLevelId}
        onChange={onLevelChange}
        options={levels.map((l) => ({ value: l.id, label: l.levelName }))}
        disabled={isLoadingLevels || !selectedCompanyId}
      />

      {/* City Selection */}
      <Select
        label="City"
        placeholder="Select City..."
        value={locationCity}
        onChange={onCityChange}
        options={cities}
      />
    </div>
  );
};
