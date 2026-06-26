/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CompanyDTO,
  RoleDTO,
  LevelDTO,
  CompensationFilters,
  CompareRequest,
  CompareResult,
  CompensationEntryWithRelations,
} from "./types";
import { SubmitCompensationInput } from "./validations";
import { ApiError } from "./api-error";
import { buildQueryString } from "./utils";

export type Company = CompanyDTO & { entries_count?: number };
export type Role = RoleDTO;
export type Level = LevelDTO & { company?: { id: string; name: string; slug: string; tier: string } };

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
    };
  };
}

/**
 * Shared native fetch wrapper that checks for non-2xx status codes and throws typed ApiError.
 */
async function apiRequest<T>(url: string, config?: RequestInit): Promise<T> {
  const response = await fetch(url, config);
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
  const queryObj: Record<string, unknown> = {};
  if (filters.companyId) queryObj.company_id = filters.companyId;
  if (filters.roleId) queryObj.role_id = filters.roleId;
  if (filters.levelId) queryObj.level_id = filters.levelId;
  if (filters.locationCity) queryObj.location_city = filters.locationCity;
  if (filters.locationCountry) queryObj.location_country = filters.locationCountry;
  if (filters.minExperience !== undefined) queryObj.min_yoe = filters.minExperience;
  if (filters.maxExperience !== undefined) queryObj.max_yoe = filters.maxExperience;
  if (filters.search) queryObj.search = filters.search;

  const queryString = buildQueryString(queryObj);
  return apiRequest<CompensationListResponse>(`/api/compensation${queryString}`, { signal });
}

/**
 * Submits standard user-reported compensation offer data securely to the DB.
 */
export async function submitCompensation(
  data: SubmitCompensationInput,
  signal?: AbortSignal
): Promise<{ success: boolean; id?: string; errors?: Record<string, string> }> {
  try {
    const result = await apiRequest<any>("/api/compensation", {
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
  return apiRequest<CompareResult>("/api/compare-offers", {
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
  const response = await apiRequest<{ data: Level[] }>(`/api/levels${queryString}`, { signal });
  return response.data;
}

/**
 * Fetches list of all standardized corporate entities.
 */
export async function fetchCompanies(signal?: AbortSignal): Promise<Company[]> {
  const response = await apiRequest<{ data: Company[] }>("/api/companies", { signal });
  return response.data;
}

/**
 * Fetches and flattens all roles from categorized groups.
 */
export async function fetchRoles(signal?: AbortSignal): Promise<Role[]> {
  const response = await apiRequest<{ data: Record<string, Role[]> }>("/api/roles", { signal });
  const grouped = response.data;
  const allRoles: Role[] = [];
  
  if (grouped) {
    Object.keys(grouped).forEach((key) => {
      if (Array.isArray(grouped[key])) {
        allRoles.push(...grouped[key]);
      }
    });
  }
  
  return allRoles;
}
