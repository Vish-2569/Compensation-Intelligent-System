/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from "react";
import { fetchLevels, Level } from "../lib/api-client";

export function useLevels(companyId?: string, roleCategory?: string) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadLevels = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLevels(companyId, roleCategory, controller.signal);
        setLevels(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error loading levels in useLevels hook:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLevels();

    return () => {
      controller.abort();
    };
  }, [companyId, roleCategory]);

  return { levels, isLoading };
}
