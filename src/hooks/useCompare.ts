/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useCallback } from "react";
import { compareCompensations } from "../lib/api-client";
import { CompareRequest, CompareResult } from "../lib/types";

export interface OfferInput {
  companyId: string;
  roleId: string;
  levelId: string;
  locationCity: string;
  baseSalary: number;
  annualBonus?: number;
  equityValueAnnual?: number;
}

export function useCompare() {
  const [slotA, setSlotA] = useState<OfferInput | null>(null);
  const [slotB, setSlotB] = useState<OfferInput | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compare = useCallback(async () => {
    if (!slotA) {
      setError(new Error("Primary offer details (slot A) are required for comparison."));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CompareRequest = {
        primaryOffer: {
          companyId: slotA.companyId,
          roleId: slotA.roleId,
          levelId: slotA.levelId,
          locationCity: slotA.locationCity,
          baseSalary: Number(slotA.baseSalary),
          annualBonus: slotA.annualBonus !== undefined ? Number(slotA.annualBonus) : undefined,
          equityValueAnnual: slotA.equityValueAnnual !== undefined ? Number(slotA.equityValueAnnual) : undefined,
        },
        competingOffer: slotB
          ? {
              companyId: slotB.companyId,
              roleId: slotB.roleId,
              levelId: slotB.levelId,
              locationCity: slotB.locationCity,
              baseSalary: Number(slotB.baseSalary),
              annualBonus: slotB.annualBonus !== undefined ? Number(slotB.annualBonus) : undefined,
              equityValueAnnual: slotB.equityValueAnnual !== undefined ? Number(slotB.equityValueAnnual) : undefined,
            }
          : undefined,
      };

      const response = await compareCompensations(payload);
      setResult(response);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [slotA, slotB]);

  const reset = useCallback(() => {
    setSlotA(null);
    setSlotB(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    slotA,
    setSlotA,
    slotB,
    setSlotB,
    compare,
    result,
    isLoading,
    error,
    reset,
  };
}
