import { z } from "zod";
import { CompanyTier, Currency, StandardLevel, COMMON_TECH_ROLES } from "../types/salaryRecord";

export const salaryRecordSchema = z.object({
  companyTier: z.nativeEnum(CompanyTier),
  companyNameOptional: z.string().trim().max(120).optional(),
  role: z.enum(COMMON_TECH_ROLES),
  standardLevel: z.nativeEnum(StandardLevel),
  baseSalary: z.number().int().min(0).max(100_000_000),
  annualBonus: z.number().int().min(0).max(100_000_000),
  annualStock: z.number().int().min(0).max(100_000_000),
  yearsOfExperience: z.number().min(0).max(50),
  officeLocation: z.string().trim().min(1).max(100),
  currency: z.nativeEnum(Currency),
  submittedAt: z.string().datetime(),
});

export type SalaryRecordInput = z.infer<typeof salaryRecordSchema>;
