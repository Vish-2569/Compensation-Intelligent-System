/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";

export interface APIErrorResponse {
  error: string;
  details?: any;
}

export function handleAPIError(error: any): NextResponse<APIErrorResponse> {
  console.error("[API Error Log]:", error);

  if (error.name === "ZodError") {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors || error.flatten()
      },
      { status: 400 }
    );
  }

  if (error.code && error.code.startsWith("P20")) {
    // Prisma database errors
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json(
    {
      error: message
    },
    { status: 500 }
  );
}

// Helper to compute percentile stats (p25, p50/median, p75) from an array of numbers
export function calculatePercentiles(numbers: number[]): {
  p25: number;
  p50: number; // median
  p75: number;
} {
  if (numbers.length === 0) {
    return { p25: 0, p50: 0, p75: 0 };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  
  const getPercentile = (p: number) => {
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    p25: Math.round(getPercentile(0.25)),
    p50: Math.round(getPercentile(0.50)),
    p75: Math.round(getPercentile(0.75))
  };
}
