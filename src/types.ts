/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RoleType {
  SOFTWARE_ENGINEER = "Software Engineer",
  DATA_ENGINEER = "Data Engineer",
  DEVOPS_ENGINEER = "DevOps Engineer",
  CYBERSECURITY_ENGINEER = "Cybersecurity Engineer",
  PRODUCT_MANAGER = "Product Manager",
  DATA_SCIENTIST = "Data Scientist",
  PRODUCT_DESIGNER = "Product Designer"
}

export enum CompanyTier {
  TIER_1 = "Tier 1 (Hyperscalers & Top Tech)",
  TIER_2 = "Tier 2 (High-Growth & Pre-IPO)",
  TIER_3 = "Tier 3 (Mature & Mainstream)"
}

export interface CompensationRecord {
  id: string;
  companyName: string;
  tier: CompanyTier;
  role: RoleType;
  levelCode: string;
  standardLevel: string;
  baseSalary: number;
  bonus: number;
  equity: number;
  totalCompensation: number;
  location: string;
  yearsOfExperience: number;
  yearsAtCompany: number;
  verified: boolean;
  submittedAt: string;
}

export interface LevelMapping {
  standardLevel: string;
  title: string;
  google: string;
  meta: string;
  apple: string;
  amazon: string;
  microsoft: string;
  netflix: string;
  flipkart: string;
}

export interface LocationInfo {
  name: string;
  country: string;
  costOfLivingIndex: number;
  currency: string;
  symbol: string;
  multiplier: number;
}

export interface Offer {
  id: string;
  name: string;
  companyName: string;
  role: RoleType;
  levelCode: string;
  baseSalary: number;
  bonus: number;
  equity: number;
}

export interface AIAdvisorRequest {
  currentOffer?: Offer;
  competingOffer?: Offer;
  marketStats?: {
    role: RoleType;
    level: string;
    avgTotalComp: number;
    highestTotalComp: number;
  };
  userQuery: string;
}

export interface AIAdvisorResponse {
  analysis: string;
  negotiationStrategy: string;
  draftMessage: string;
}

export interface ImageGenerationRequest {
  offerName: string;
  companyName: string;
  role: string;
  level: string;
  totalComp: number;
  baseSalary: number;
  bonus: number;
  equity: number;
  size: "1K" | "2K" | "4K";
}
