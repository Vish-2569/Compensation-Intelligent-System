/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import {
  CompanyDTO,
  RoleDTO,
  LevelDTO,
  CompensationFilters,
  CompareRequest,
  CompareResult,
  CompensationEntryWithRelations,
} from "./types";
import { STAGE_LOCATIONS } from "../data";
import { SubmitCompensationInput } from "./validations";
import { ApiError } from "./api-error";
import { buildQueryString } from "./utils";

export type Company = CompanyDTO & { entries_count?: number };
export type Role = RoleDTO;
export type Level = LevelDTO & { company?: { id: string; name: string; slug: string; tier: string } };
export type Location = { name: string; country: string; costOfLivingIndex: number; currency: string; symbol: string; multiplier: number };

const fallbackCompanies: Company[] = [
  { id: "company-google", name: "Google", slug: "google", tier: "FAANG", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 128 },
  { id: "company-microsoft", name: "Microsoft", slug: "microsoft", tier: "FAANG", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 96 },
  { id: "company-flipkart", name: "Flipkart", slug: "flipkart", tier: "UNICORN", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 53 },
  { id: "company-swiggy", name: "Swiggy", slug: "swiggy", tier: "UNICORN", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 34 },
  { id: "company-razorpay", name: "Razorpay", slug: "razorpay", tier: "UNICORN", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 19 },
  { id: "company-zepto", name: "Zepto", slug: "zepto", tier: "STARTUP", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 11 },
  { id: "company-atlassian", name: "Atlassian", slug: "atlassian", tier: "MNC", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 65 },
  { id: "company-thoughtworks", name: "Thoughtworks", slug: "thoughtworks", tier: "MNC", logoUrl: "", createdAt: new Date("2024-01-01T00:00:00Z"), entries_count: 42 },
];

const fallbackRoles: Role[] = [
  { id: "role-software-engineer", name: "Software Engineer", slug: "software-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-data-engineer", name: "Data Engineer", slug: "data-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-devops-engineer", name: "DevOps Engineer", slug: "devops-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-product-manager", name: "Product Manager", slug: "product-manager", category: "PRODUCT", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-data-scientist", name: "Data Scientist", slug: "data-scientist", category: "DATA", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-frontend-engineer", name: "Frontend Engineer", slug: "frontend-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-backend-engineer", name: "Backend Engineer", slug: "backend-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
  { id: "role-platform-engineer", name: "Platform Engineer", slug: "platform-engineer", category: "ENGINEERING", createdAt: new Date("2024-01-01T00:00:00Z") },
];

const fallbackLocations: Location[] = STAGE_LOCATIONS as Location[];

export interface CompensationListResponse {
  data: CompensationEntryWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    stats: {
      median_base: number;
      median_total: number;
      p25_total: number;
      p75_total: number;
      highest_total: number;
      count: number;
      market_range?: {
        min: number;
        max: number;
        median: number;
        p25: number;
        p75: number;
      };
      min_total_compensation?: number;
      max_total_compensation?: number;
      submission_count?: number;
      average_total_compensation?: number;
      average_base_salary?: number;
      average_annual_bonus?: number;
      average_equity_value?: number;
      average_years_of_experience?: number;
      histogram?: {
        buckets: Array<{
          label: string;
          start: number;
          end: number;
          count: number;
        }>;
        labels: string[];
        counts: number[];
      };
    };
  };
}

/**
 * Shared native fetch wrapper that checks for non-2xx status codes and throws typed ApiError.
 */
async function apiRequest<T>(url: string, config?: RequestInit): Promise<T> {
  const finalUrl = /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`;
  const response = await fetch(finalUrl, config);
  if (!response.ok) {
    let errorInfo: any = null;
    try {
      errorInfo = await response.json();
    } catch {
      // Swallowing non-JSON error bodies
    }
    const message = errorInfo?.error || errorInfo?.message || `API error (${response.status})`;
    throw new ApiError(message, response.status, errorInfo);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches the paginated and filtered compensation entries.
 */
export async function fetchCompensations(
  filters: CompensationFilters,
  signal?: AbortSignal
): Promise<CompensationListResponse> {
  const hasValue = (value: unknown): boolean => value !== undefined && value !== null && value !== "";

  const queryObj: Record<string, unknown> = {};
  if (hasValue(filters.companyId)) queryObj.company_id = filters.companyId;
  if (hasValue(filters.roleId)) queryObj.role_id = filters.roleId;
  if (hasValue(filters.levelId)) queryObj.level_id = filters.levelId;
  if (hasValue(filters.locationCity)) queryObj.location_city = filters.locationCity;
  if (hasValue(filters.locationCountry)) queryObj.location_country = filters.locationCountry;
  if (filters.minExperience !== undefined && filters.minExperience !== null) queryObj.min_yoe = filters.minExperience;
  if (filters.maxExperience !== undefined && filters.maxExperience !== null) queryObj.max_yoe = filters.maxExperience;
  if (hasValue(filters.search)) queryObj.search = filters.search;

  const queryString = buildQueryString(queryObj);
  const url = `/api/compensation${queryString}`;

  console.log("[fetchCompensations] current filters:", filters);
  console.log("[fetchCompensations] API URL:", url);

  const response = await apiRequest<CompensationListResponse>(url, { signal });

  console.log("[fetchCompensations] response count:", response.data.length);
  return response;
}

/**
 * Submits standard user-reported compensation offer data securely to the DB.
 */
export async function submitCompensation(
  data: SubmitCompensationInput,
  signal?: AbortSignal
): Promise<{ success: boolean; id?: string; errors?: Record<string, string> }> {
  try {
    const result = await apiRequest<any>(`/api/compensation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal,
    });
    return {
      success: true,
      id: result.id,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      return {
        success: false,
        errors: error.info?.errors || { global: error.message },
      };
    }
    return {
      success: false,
      errors: { global: error?.message || "An unexpected submission error occurred." },
    };
  }
}

/**
 * Compares primary offer with optional competing offer details.
 */
export async function compareCompensations(
  request: CompareRequest,
  signal?: AbortSignal
): Promise<CompareResult> {
  return apiRequest<CompareResult>(`/api/compare-offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });
}

/**
 * Fetches company specific standard levels filtered dynamically by role category.
 */
export async function fetchLevels(
  companyId?: string,
  roleCategory?: string,
  signal?: AbortSignal
): Promise<Level[]> {
  const queryObj: Record<string, unknown> = {};
  if (companyId) queryObj.company_id = companyId;
  if (roleCategory) queryObj.role_category = roleCategory;

  const queryString = buildQueryString(queryObj);
  try {
    const response = await apiRequest<{ data?: Level[] }>(`/api/levels${queryString}`, { signal });
    return Array.isArray(response?.data) ? response.data : [];
  } catch {
    return [];
  }
}

/**
 * Fetches list of all standardized corporate entities.
 */
export async function fetchCompanies(signal?: AbortSignal): Promise<Company[]> {
  try {
    const response = await apiRequest<{ data?: Company[] }>(`/api/companies`, { signal });
    return Array.isArray(response?.data) ? response.data : fallbackCompanies;
  } catch {
    return fallbackCompanies;
  }
}

/**
 * Fetches and flattens all roles from categorized groups.
 */
export async function fetchRoles(signal?: AbortSignal): Promise<Role[]> {
  try {
    const response = await apiRequest<{ data?: Record<string, Role[]> }>(`/api/roles`, { signal });
    const grouped = response?.data;
    const allRoles: Role[] = [];

    if (grouped) {
      Object.keys(grouped).forEach((key) => {
        if (Array.isArray(grouped[key])) {
          allRoles.push(...grouped[key]);
        }
      });
    }

    return allRoles.length > 0 ? allRoles : fallbackRoles;
  } catch {
    return fallbackRoles;
  }
}

/**
 * Fetches popular office locations from the backend
a.
 */
export async function fetchLocations(signal?: AbortSignal): Promise<Location[]> {
  try {
    const response = await apiRequest<Location[]>(`/api/locations`, { signal });
    return Array.isArray(response) ? response : fallbackLocations;
  } catch {
    return fallbackLocations;
  }
}
