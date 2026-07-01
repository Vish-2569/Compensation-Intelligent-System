/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from "react";
import { fetchRoles, Role } from "../lib/api-client";

let cachedRoles: Role[] | null = null;
let cachedPromise: Promise<Role[]> | null = null;

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>(cachedRoles || []);
  const [isLoading, setIsLoading] = useState(!cachedRoles);

  useEffect(() => {
    if (cachedRoles) {
      setRoles(cachedRoles);
      setIsLoading(false);
      return;
    }

    const loadRoles = async () => {
      setIsLoading(true);
      try {
        if (!cachedPromise) {
          cachedPromise = fetchRoles();
        }
        const data = await cachedPromise;
        cachedRoles = data;
        setRoles(data);
      } catch (err) {
        console.error("Error loading roles in useRoles hook:", err);
        cachedPromise = null;
        if (!cachedRoles) {
          setRoles([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, []);

  return { roles, isLoading };
}
