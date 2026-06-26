/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubmitCompensationInput } from "./validations";

export interface QualityAssessment {
  score: number;
  flags: string[];
}

const KNOWN_CITIES = [
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Delhi NCR",
  "Remote"
];

/**
 * Heuristically evaluates the quality, consistency, and sanity of a compensation entry.
 * Returns a quality score from 0 to 100 and a list of structural or statistical warning flags.
 */
export function assessEntryQuality(entry: SubmitCompensationInput): QualityAssessment {
  const flags: string[] = [];
  let score = 100;

  // Rule 1: Base salary 0 or > 5Cr/year (50,000,000 INR)
  const baseVal = entry.baseSalary;
  if (baseVal <= 0 || baseVal > 50000000) {
    flags.push("suspicious_base_salary");
    score -= 30;
  }

  // Rule 2: Equity > 10x base
  const equityVal = entry.equityValueAnnual ?? 0;
  if (equityVal > 10 * baseVal) {
    flags.push("suspicious_equity_ratio");
    score -= 20;
  }

  // Rule 3: Years of Experience > 40
  if (entry.yearsOfExperience > 40) {
    flags.push("invalid_years_of_experience");
    score -= 40;
  }

  // Rule 4: City not in known list
  if (!KNOWN_CITIES.includes(entry.locationCity)) {
    flags.push("unrecognized_location_city");
    score -= 10;
  }

  // Rule 5: Offer date in future
  if (entry.offerDate) {
    const parts = entry.offerDate.split("-");
    if (parts.length === 2) {
      const month = parseInt(parts[0], 10);
      const year = parseInt(parts[1], 10);
      if (!isNaN(month) && !isNaN(year)) {
        // Today's date reference
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-indexed

        if (year > currentYear || (year === currentYear && month > currentMonth)) {
          flags.push("invalid_future_offer_date");
          score -= 40;
        }
      }
    }
  }

  return {
    score: Math.max(0, score),
    flags,
  };
}
