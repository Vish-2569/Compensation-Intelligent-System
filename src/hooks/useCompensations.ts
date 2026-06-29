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

  const performFetch = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        console.log("[useCompensations] current filters:", filters);
        const response = await fetchCompensations(filters, signal);

        if (signal?.aborted) {
          return;
        }

        console.log("[useCompensations] response count:", response.data.length);
        setData(response.data);
        setStats(response.meta.stats);
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError" || signal?.aborted) {
          return;
        }

        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    performFetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, [performFetch]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    performFetch(controller.signal);
  }, [performFetch]);

  return { data, stats, isLoading, error, refetch };
}
