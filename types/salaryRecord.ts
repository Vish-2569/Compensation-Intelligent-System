export enum CompanyTier {
  Startup = "Startup",
  Growth = "Growth",
  Tier3Mature = "Tier3-Mature",
  Tier2BigTech = "Tier2-Big-Tech",
  Tier1FAANG = "Tier1-FAANG",
}

export enum StandardLevel {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
  L5 = "L5",
  L6 = "L6",
  L7 = "L7",
  L8 = "L8",
}

export enum Currency {
  INR = "INR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

export const COMMON_TECH_ROLES = [
  "Software Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Cybersecurity Engineer",
  "Product Manager",
  "Data Scientist",
  "Machine Learning Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Platform Engineer",
] as const;

export type SalaryRecord = {
  companyTier: CompanyTier;
  companyNameOptional?: string;
  role: (typeof COMMON_TECH_ROLES)[number];
  standardLevel: StandardLevel;
  baseSalary: number;
  annualBonus: number;
  annualStock: number;
  yearsOfExperience: number;
  officeLocation: string;
  currency: Currency;
  submittedAt: string;
};
