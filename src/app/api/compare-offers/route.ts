/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { CompareRequestSchema } from "../../../lib/validations";
import { handleAPIError } from "../../../lib/api-utils";

// Cost of Living multipliers relative to Bangalore (1.0)
const COL_MULTIPLIERS: Record<string, number> = {
  "Bangalore": 1.0,
  "Mumbai": 1.25,
  "Delhi NCR": 1.15,
  "Pune": 0.90,
  "Hyderabad": 0.95,
  "Chennai": 0.92,
  "Remote": 1.0,
  "Other": 1.0,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CompareRequestSchema.parse(body);

    const primary = validated.primaryOffer;
    const primaryTotal = primary.baseSalary + (primary.annualBonus ?? 0) + (primary.equityValueAnnual ?? 0);

    let competingTotal: number | undefined = undefined;
    let differencePercentage: number | undefined = undefined;
    let costOfLivingParityAdjustment: number | undefined = undefined;
    const leveragePoints: string[] = [];

    if (validated.competingOffer) {
      const competing = validated.competingOffer;
      competingTotal = competing.baseSalary + (competing.annualBonus ?? 0) + (competing.equityValueAnnual ?? 0);

      const diff = competingTotal - primaryTotal;
      differencePercentage = primaryTotal > 0 ? Number(((diff / primaryTotal) * 100).toFixed(2)) : 0;

      // Calculate cost of living parity
      const primaryCol = COL_MULTIPLIERS[primary.locationCity] || 1.0;
      const competingCol = COL_MULTIPLIERS[competing.locationCity] || 1.0;
      costOfLivingParityAdjustment = Number((competingCol / primaryCol).toFixed(2));

      // Generate leverage points
      if (competingTotal > primaryTotal) {
        leveragePoints.push(`The competing offer provides ${differencePercentage}% higher overall annual compensation.`);
      } else if (competingTotal < primaryTotal) {
        leveragePoints.push(`The primary offer exceeds the competing offer by ${Math.abs(differencePercentage)}% overall.`);
      } else {
        leveragePoints.push(`Both offers provide equal total compensation.`);
      }

      if ((competing.baseSalary ?? 0) > (primary.baseSalary ?? 0)) {
        const baseDiffPct = Number((((competing.baseSalary - primary.baseSalary) / primary.baseSalary) * 100).toFixed(2));
        leveragePoints.push(`Competing offer has a stronger base salary (+${baseDiffPct}%). Use this to negotiate a primary base bump.`);
      } else if ((primary.baseSalary ?? 0) > (competing.baseSalary ?? 0)) {
        const baseDiffPct = Number((((primary.baseSalary - competing.baseSalary) / competing.baseSalary) * 100).toFixed(2));
        leveragePoints.push(`Primary offer has a stronger base salary (+${baseDiffPct}% relative to competing).`);
      }

      const competingEquity = competing.equityValueAnnual ?? 0;
      const primaryEquity = primary.equityValueAnnual ?? 0;
      if (competingEquity > primaryEquity) {
        leveragePoints.push(`Competing offer has higher annual equity value. Ask the primary company if they can match with an additional sign-on grant.`);
      }

      if (primary.locationCity !== competing.locationCity) {
        const ratio = competingCol / primaryCol;
        if (ratio > 1.0) {
          const pct = Math.round((ratio - 1) * 100);
          leveragePoints.push(`Cost of living in ${competing.locationCity} is estimated to be ~${pct}% higher than ${primary.locationCity}. Keep this in mind for net purchasing power.`);
        } else if (ratio < 1.0) {
          const pct = Math.round((1 - ratio) * 100);
          leveragePoints.push(`Cost of living in ${competing.locationCity} is estimated to be ~${pct}% lower than ${primary.locationCity}, offering higher local purchasing power.`);
        }
      }
    } else {
      // Primary offer only
      leveragePoints.push("Ensure you have a secondary standard or range reference before negotiating.");
      leveragePoints.push("Highlight your specialized domain expertise or unique experience when discussing the offer details.");
    }

    return NextResponse.json({
      primaryTotal,
      competingTotal,
      differencePercentage,
      costOfLivingParityAdjustment,
      leveragePoints,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
