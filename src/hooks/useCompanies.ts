/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from "react";
import { fetchCompanies, Company } from "../lib/api-client";

// Simple memoization variables at the module level
let cachedCompanies: Company[] | null = null;
let cachedPromise: Promise<Company[]> | null = null;

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>(cachedCompanies || []);
  const [isLoading, setIsLoading] = useState(!cachedCompanies);

  useEffect(() => {
    if (cachedCompanies) {
      setCompanies(cachedCompanies);
      setIsLoading(false);
      return;
    }

    const loadCompanies = async () => {
      setIsLoading(true);
      try {
        if (!cachedPromise) {
          cachedPromise = fetchCompanies();
        }
        const data = await cachedPromise;
        cachedCompanies = data;
        setCompanies(data);
      } catch (err) {
        console.error("Error loading companies in useCompanies hook:", err);
        // Reset the promise cache so we can attempt a retry on next render/mount
        cachedPromise = null;
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return { companies, isLoading };
}
