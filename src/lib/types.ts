/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompanyDTO {
  id: string;
  name: string;
  slug: string;
  tier: string;
  logoUrl?: string | null;
  createdAt: Date;
}

export interface RoleDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  createdAt: Date;
}

export interface LevelDTO {
  id: string;
  companyId: string;
  roleCategory: string;
  levelName: string;
  levelOrder: number;
  createdAt: Date;
}

export interface CompensationEntryWithRelations {
  id: string;
  companyId: string;
  roleId: string;
  levelId: string;
  locationCity: string;
  locationCountry: string;
  locationRegion: string;
  yearsOfExperience: number;
  baseSalary: number; // Decimal converted to number for frontend consumption
  annualBonus?: number | null;
  equityValueAnnual?: number | null;
  totalCash: number;
  totalCompensation: number;
  currency: string;
  offerDate: string;
  employmentType: string;
  dataSource: string;
  isVerified: boolean;
  createdAt: Date;
  deletedAt?: Date | null;

  company: CompanyDTO;
  role: RoleDTO;
  level: LevelDTO;
}

export interface CompensationFilters {
  roleId?: string;
  companyId?: string;
  levelId?: string;
  locationCity?: string;
  locationCountry?: string;
  minExperience?: number;
  maxExperience?: number;
  search?: string;
}

export interface CompensationStats {
  averageBase: number;
  averageBonus: number;
  averageEquity: number;
  averageTotal: number;
  medianTotal: number;
  highestTotal: number;
  count: number;
}

export interface CompareRequest {
  primaryOffer: {
    companyId: string;
    roleId: string;
    levelId: string;
    locationCity: string;
    baseSalary: number;
    annualBonus?: number;
    equityValueAnnual?: number;
  };
  competingOffer?: {
    companyId: string;
    roleId: string;
    levelId: string;
    locationCity: string;
    baseSalary: number;
    annualBonus?: number;
    equityValueAnnual?: number;
  };
}

export interface CompareResult {
  primaryTotal: number;
  competingTotal?: number;
  differencePercentage?: number;
  costOfLivingParityAdjustment?: number; // adjustment coefficient
  leveragePoints: string[];
}
