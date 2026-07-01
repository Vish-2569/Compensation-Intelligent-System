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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface CompensationPersonality {
  personality: string;
  icon: string;
  color: string;
  description: string;
  tagline: string;
  why: string;
  watchOuts: string[];
  metrics: {
    salaryFocus: number;
    equityPotential: number;
    performance: number;
    stability: number;
  };
}

export function getCompensationPersonality(
  baseSalary: number,
  annualBonus: number,
  annualStock: number
): CompensationPersonality {
  const totalComp = baseSalary + annualBonus + annualStock;
  const salaryPct = totalComp > 0 ? baseSalary / totalComp : 0;
  const bonusPct = totalComp > 0 ? annualBonus / totalComp : 0;
  const stockPct = totalComp > 0 ? annualStock / totalComp : 0;

  const metrics = {
    salaryFocus: Math.round(salaryPct * 100),
    equityPotential: Math.round(stockPct * 100),
    performance: Math.round(bonusPct * 100),
    stability: Math.round(clamp(salaryPct * 100 + 10, 0, 100)),
  };

  const isInRange = (value: number, min: number, max: number): boolean => value >= min && value <= max;

  if (stockPct >= 0.55) {
    return {
      personality: "🚀 The Rocket",
      icon: "🚀",
      color: "#8b5cf6",
      description: "This package is built for aggressive long-term upside with equity driving most of its value.",
      tagline: "Equity-first acceleration.",
      why: "Your compensation package is anchored in stock value, making it ideal for long-term upside and founder-scale growth.",
      watchOuts: ["High short-term risk", "Lower cash today", "Equity dilution", "Exit timing", "Share price volatility"],
      metrics,
    };
  }

  if (bonusPct >= 0.25) {
    return {
      personality: "🎯 The Rainmaker",
      icon: "🎯",
      color: "#0ea5e9",
      description: "Your package leans into performance rewards, making results and execution a core part of total compensation.",
      tagline: "Rewarding achievement.",
      why: "This compensation mix rewards delivery and execution, where strong performance directly grows your earnings and impact.",
      watchOuts: ["Variable income", "Pressure cycles", "Performance dependency", "Bonus cliffs", "Less guaranteed stability"],
      metrics,
    };
  }

  if (salaryPct >= 0.85 && stockPct < 0.1 && bonusPct < 0.1) {
    return {
      personality: "💰 The Cash King",
      icon: "💰",
      color: "#10b981",
      description: "Your package maximizes guaranteed cash compensation with minimal reliance on incentives or equity.",
      tagline: "Guaranteed cash reigns.",
      why: "You prioritize take-home certainty over incentive upside, with salary leading the way in every paycheck.",
      watchOuts: ["Less long-term upside", "Equity scarcity", "Limited leverage", "Opportunity cost", "Slower wealth buildup"],
      metrics,
    };
  }

  if (salaryPct >= 0.8 && bonusPct < 0.05 && stockPct < 0.15) {
    return {
      personality: "🛡 The Guardian",
      icon: "🛡",
      color: "#64748b",
      description: "A highly stable compensation package built around dependable salary with very little variability.",
      tagline: "Safety first savings.",
      why: "This package is built for dependable living expenses and low compensation risk.",
      watchOuts: ["Lower upside", "Limited variable pay", "Slower growth", "Conservative returns", "Less equity exposure"],
      metrics,
    };
  }

  if (stockPct >= 0.4 && salaryPct < 0.55) {
    return {
      personality: "📈 The Investor",
      icon: "📈",
      color: "#4f46e5",
      description: "A large portion of your compensation is tied to equity, prioritizing long-term wealth creation.",
      tagline: "Wealth creation playbook.",
      why: "Large equity stakes define your package, turning today’s work into future ownership gains.",
      watchOuts: ["Cash compression", "Exit dependency", "Equity dilution", "Illiquidity", "Startup risk"],
      metrics,
    };
  }

  if (isInRange(salaryPct, 0.4, 0.6) && isInRange(stockPct, 0.25, 0.45) && isInRange(bonusPct, 0.15, 0.3)) {
    return {
      personality: "👑 The Executive",
      icon: "👑",
      color: "#eab308",
      description: "A sophisticated compensation package where salary, bonus, and equity all contribute significantly.",
      tagline: "Executive-level balance.",
      why: "Your compensation is a polished blend of salary, bonus, and equity—a profile built for leadership contributors.",
      watchOuts: ["Complex package", "Higher expectations", "More accountability", "Review cycles", "Mixed payout timing"],
      metrics,
    };
  }

  if (isInRange(salaryPct, 0.45, 0.65) && isInRange(stockPct, 0.2, 0.4) && isInRange(bonusPct, 0.15, 0.3)) {
    return {
      personality: "🔥 The Accelerator",
      icon: "🔥",
      color: "#ef4444",
      description: "A growth-oriented package balancing guaranteed income with meaningful incentives and equity.",
      tagline: "Growth with momentum.",
      why: "A lively pay structure that supports career acceleration while still rewarding consistent performance.",
      watchOuts: ["Moderate variability", "Performance reliance", "Balanced risk", "Equity timing", "Milestone pressure"],
      metrics,
    };
  }

  if (isInRange(salaryPct, 0.55, 0.7) && isInRange(stockPct, 0.15, 0.3) && bonusPct < 0.2) {
    return {
      personality: "⚖️ The Balanced Builder",
      icon: "⚖️",
      color: "#14b8a6",
      description: "A balanced package where salary, bonus, and equity work together without one dominating.",
      tagline: "Stability meets upside.",
      why: "Your earnings are designed to keep pace today while letting future upside catch up gradually.",
      watchOuts: ["Moderate reward", "No single standout engine", "Slower peak upside", "Need steady execution", "Complex tradeoffs"],
      metrics,
    };
  }

  if (isInRange(stockPct, 0.35, 0.6) && salaryPct < 0.6 && bonusPct < 0.1) {
    return {
      personality: "🌱 The Startup Bet",
      icon: "🌱",
      color: "#ec4899",
      description: "Lower guaranteed income paired with meaningful equity, reflecting a higher-risk, higher-upside package.",
      tagline: "Risk for potential reward.",
      why: "A smaller salary base is offset by meaningful equity, making this ideal for founders or early startup builders.",
      watchOuts: ["Low cash", "High risk", "Liquidity uncertainty", "Long horizon", "Burn sensitivity"],
      metrics,
    };
  }

  if (salaryPct >= 0.7 && isInRange(stockPct, 0.1, 0.25) && bonusPct < 0.2) {
    return {
      personality: "🧱 The Builder",
      icon: "🧱",
      color: "#3b82f6",
      description: "Strong salary with dependable income and moderate equity. Designed for predictable earnings while maintaining long-term wealth potential.",
      tagline: "Steady growth foundation.",
      why: "This package is built around predictable salary while preserving moderate long-term return from equity.",
      watchOuts: ["Moderate upside", "Slower equity returns", "Less rapid payoff", "Conservative path", "Incremental advancement"],
      metrics,
    };
  }

  return {
    personality: "🧱 The Builder",
    icon: "🧱",
    color: "#3b82f6",
    description: "Strong salary with dependable income and moderate equity. Designed for predictable earnings while maintaining long-term wealth potential.",
    tagline: "Steady growth foundation.",
    why: "This package is built around predictable salary while preserving moderate long-term return from equity.",
    watchOuts: ["Moderate upside", "Slower equity returns", "Less rapid payoff", "Conservative path", "Incremental advancement"],
    metrics,
  };
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
