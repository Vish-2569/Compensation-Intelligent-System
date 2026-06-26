/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Formats a number as Indian rupees using the short scale used in the app.
export function formatINR(amount: number): string {
  if (amount < 100000) {
    return `₹${amount.toLocaleString("en-IN")}`;
  } else if (amount < 10000000) {
    const lakhs = amount / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${formatted}L`;
  } else {
    const crores = amount / 10000000;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(1);
    return `₹${formatted}Cr`;
  }
}

// Computes total compensation from base pay, bonus, and equity.
export function computeTotalComp(base: number, bonus?: number, equity?: number): number {
  return base + (bonus ?? 0) + (equity ?? 0);
}

// Calculates the absolute and percentage difference between two compensation values.
export function getCompDelta(
  a: number,
  b: number
): { diff: number; pct: number; direction: "higher" | "lower" | "same" } {
  const diff = b - a;
  const absDiff = Math.abs(diff);
  const pct = a > 0 ? (absDiff / a) * 100 : 0;
  
  let direction: "higher" | "lower" | "same" = "same";
  if (diff > 0) {
    direction = "higher";
  } else if (diff < 0) {
    direction = "lower";
  }

  return {
    diff: absDiff,
    pct: parseFloat(pct.toFixed(2)),
    direction,
  };
}

// Converts a label into a URL-friendly slug.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Builds a query string while omitting empty values and handling arrays.
export function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((val) => {
        if (val !== undefined && val !== null && val !== "") {
          params.append(key, String(val));
        }
      });
    } else {
      params.append(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
