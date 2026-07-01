/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from "react";
import { fetchLocations, Location } from "../lib/api-client";

let cachedLocations: Location[] | null = null;
let cachedPromise: Promise<Location[]> | null = null;

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>(cachedLocations || []);
  const [isLoading, setIsLoading] = useState(!cachedLocations);

  useEffect(() => {
    if (cachedLocations) {
      setLocations(cachedLocations);
      setIsLoading(false);
      return;
    }

    const loadLocations = async () => {
      setIsLoading(true);
      try {
        if (!cachedPromise) {
          cachedPromise = fetchLocations();
        }
        const data = await cachedPromise;
        cachedLocations = data;
        setLocations(data);
      } catch (err) {
        console.error("Error loading locations in useLocations hook:", err);
        cachedPromise = null;
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  return { locations, isLoading };
}
