/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchCompensations, CompensationListResponse } from "../lib/api-client";
import { CompensationFilters, CompensationEntryWithRelations } from "../lib/types";

export function useCompensations(filters: CompensationFilters) {
  const [data, setData] = useState<CompensationEntryWithRelations[]>([]);
  const [stats, setStats] = useState<CompensationListResponse["meta"]["stats"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [debouncedFilters, setDebouncedFilters] = useState<CompensationFilters>(filters);

  // Debounce filter modifications by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [
    filters.companyId,
    filters.roleId,
    filters.levelId,
    filters.locationCity,
    filters.locationCountry,
    filters.minExperience,
    filters.maxExperience,
    filters.search,
  ]);

  const performFetch = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const response = await fetchCompensations(debouncedFilters, signal);
        setData(response.data);
        setStats(response.meta.stats);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedFilters]
  );

  useEffect(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
    return () => {
      controller.abort();
    };
  }, [performFetch]);

  const refetch = useCallback(() => {
    performFetch();
  }, [performFetch]);

  return { data, stats, isLoading, error, refetch };
}
