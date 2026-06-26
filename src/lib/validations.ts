/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";

// Zod schemas for Compensation Intelligence System forms & queries

export const SubmitCompensationSchema = z.object({
  companyId: z.string().uuid("Invalid Company ID selection"),
  roleId: z.string().uuid("Invalid Role ID selection"),
  levelId: z.string().uuid("Invalid Level ID selection"),
  locationCity: z.string().min(2, "City name must be at least 2 characters"),
  locationCountry: z.string().min(2, "Country name must be at least 2 characters"),
  locationRegion: z.string().min(2, "Region is required"),
  yearsOfExperience: z
    .number()
    .int("Years of experience must be an integer")
    .min(0, "Years of experience cannot be negative")
    .max(50, "Experience bounds exceeded"),
  baseSalary: z
    .number()
    .min(100000, "Base salary must be at least ₹1,00,000 INR")
    .max(120000000, "Salary limit exceeded"),
  annualBonus: z
    .number()
    .min(0, "Bonus cannot be negative")
    .max(5000000, "Bonus limit exceeded")
    .optional()
    .default(0),
  equityValueAnnual: z
    .number()
    .min(0, "Equity value cannot be negative")
    .max(10000000, "Equity limit exceeded")
    .optional()
    .default(0),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code").default("INR"),
  offerDate: z.string().regex(/^\d{2}-\d{4}$/, "Offer date must be in MM-YYYY format"),
  employmentType: z.enum(["FULLTIME", "CONTRACT", "INTERN"]).default("FULLTIME"),
  dataSource: z.enum(["SELF_REPORTED", "IMPORTED"]).default("SELF_REPORTED")
});

export const FilterCompensationSchema = z.object({
  roleId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  levelId: z.string().uuid().optional(),
  locationCity: z.string().optional(),
  locationCountry: z.string().optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  maxExperience: z.coerce.number().int().min(0).optional(),
  search: z.string().optional()
});

export const CompareRequestSchema = z.object({
  primaryOffer: z.object({
    companyId: z.string().uuid("Primary company must be valid"),
    roleId: z.string().uuid("Primary role must be valid"),
    levelId: z.string().uuid("Primary level must be valid"),
    locationCity: z.string().min(2),
    baseSalary: z.number().min(0),
    annualBonus: z.number().optional().default(0),
    equityValueAnnual: z.number().optional().default(0),
  }),
  competingOffer: z
    .object({
      companyId: z.string().uuid("Competing company must be valid"),
      roleId: z.string().uuid("Competing role must be valid"),
      levelId: z.string().uuid("Competing level must be valid"),
      locationCity: z.string().min(2),
      baseSalary: z.number().min(0),
      annualBonus: z.number().optional().default(0),
      equityValueAnnual: z.number().optional().default(0),
    })
    .optional()
});

export type SubmitCompensationInput = z.infer<typeof SubmitCompensationSchema>;
export type FilterCompensationInput = z.infer<typeof FilterCompensationSchema>;
export type CompareRequestInput = z.infer<typeof CompareRequestSchema>;
