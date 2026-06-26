/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Compensation Intelligence System Database...");

  // Clean existing tables safely
  await prisma.levelMapping.deleteMany({});
  await prisma.compensationEntry.deleteMany({});
  await prisma.level.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.company.deleteMany({});

  // 1. Seed 8 Companies
  const google = await prisma.company.create({
    data: {
      name: "Google",
      slug: "google",
      tier: "FAANG",
      logoUrl: "https://logo.clearbit.com/google.com"
    }
  });

  const microsoft = await prisma.company.create({
    data: {
      name: "Microsoft",
      slug: "microsoft",
      tier: "FAANG",
      logoUrl: "https://logo.clearbit.com/microsoft.com"
    }
  });

  const flipkart = await prisma.company.create({
    data: {
      name: "Flipkart",
      slug: "flipkart",
      tier: "UNICORN",
      logoUrl: "https://logo.clearbit.com/flipkart.com"
    }
  });

  const swiggy = await prisma.company.create({
    data: {
      name: "Swiggy",
      slug: "swiggy",
      tier: "UNICORN",
      logoUrl: "https://logo.clearbit.com/swiggy.com"
    }
  });

  const razorpay = await prisma.company.create({
    data: {
      name: "Razorpay",
      slug: "razorpay",
      tier: "UNICORN",
      logoUrl: "https://logo.clearbit.com/razorpay.com"
    }
  });

  const zepto = await prisma.company.create({
    data: {
      name: "Zepto",
      slug: "zepto",
      tier: "STARTUP",
      logoUrl: "https://logo.clearbit.com/zepto.co"
    }
  });

  const atlassian = await prisma.company.create({
    data: {
      name: "Atlassian",
      slug: "atlassian",
      tier: "MNC",
      logoUrl: "https://logo.clearbit.com/atlassian.com"
    }
  });

  const thoughtworks = await prisma.company.create({
    data: {
      name: "Thoughtworks",
      slug: "thoughtworks",
      tier: "MNC",
      logoUrl: "https://logo.clearbit.com/thoughtworks.com"
    }
  });

  const companies = [google, microsoft, flipkart, swiggy, razorpay, zepto, atlassian, thoughtworks];

  // 2. Seed Roles (4 Categories, multiple roles each)
  const swe = await prisma.role.create({
    data: { name: "Software Engineer", slug: "software-engineer", category: "ENGINEERING" }
  });
  const sde = await prisma.role.create({
    data: { name: "Backend Developer", slug: "backend-developer", category: "ENGINEERING" }
  });
  const pm = await prisma.role.create({
    data: { name: "Product Manager", slug: "product-manager", category: "PRODUCT" }
  });
  const designer = await prisma.role.create({
    data: { name: "Product Designer", slug: "product-designer", category: "DESIGN" }
  });
  const ds = await prisma.role.create({
    data: { name: "Data Scientist", slug: "data-scientist", category: "DATA" }
  });

  const roles = [swe, sde, pm, designer, ds];

  // 3. Seed Levels for Google & Microsoft & Atlassian (e.g. L3 to L6)
  const levelsData = [
    // Google Engineering
    { companyId: google.id, cat: "ENGINEERING", name: "L3", order: 1 },
    { companyId: google.id, cat: "ENGINEERING", name: "L4", order: 2 },
    { companyId: google.id, cat: "ENGINEERING", name: "L5", order: 3 },
    { companyId: google.id, cat: "ENGINEERING", name: "L6", order: 4 },
    // Microsoft Engineering
    { companyId: microsoft.id, cat: "ENGINEERING", name: "SDE I (59)", order: 1 },
    { companyId: microsoft.id, cat: "ENGINEERING", name: "SDE II (61)", order: 2 },
    { companyId: microsoft.id, cat: "ENGINEERING", name: "Senior SDE (63)", order: 3 },
    { companyId: microsoft.id, cat: "ENGINEERING", name: "Principal SDE (65)", order: 4 },
    // Atlassian Engineering
    { companyId: atlassian.id, cat: "ENGINEERING", name: "P30", order: 1 },
    { companyId: atlassian.id, cat: "ENGINEERING", name: "P40", order: 2 },
    { companyId: atlassian.id, cat: "ENGINEERING", name: "P50", order: 3 },
    { companyId: atlassian.id, cat: "ENGINEERING", name: "P60", order: 4 },
    // Swiggy Engineering
    { companyId: swiggy.id, cat: "ENGINEERING", name: "SDE 1", order: 1 },
    { companyId: swiggy.id, cat: "ENGINEERING", name: "SDE 2", order: 2 },
    { companyId: swiggy.id, cat: "ENGINEERING", name: "SDE 3", order: 3 },
    { companyId: swiggy.id, cat: "ENGINEERING", name: "Principal", order: 4 },
    // Razorpay Engineering
    { companyId: razorpay.id, cat: "ENGINEERING", name: "SDE I", order: 1 },
    { companyId: razorpay.id, cat: "ENGINEERING", name: "SDE II", order: 2 },
    { companyId: razorpay.id, cat: "ENGINEERING", name: "Senior SDE", order: 3 },
    { companyId: razorpay.id, cat: "ENGINEERING", name: "Lead SDE", order: 4 },
    // Flipkart Engineering
    { companyId: flipkart.id, cat: "ENGINEERING", name: "SDE-1", order: 1 },
    { companyId: flipkart.id, cat: "ENGINEERING", name: "SDE-2", order: 2 },
    { companyId: flipkart.id, cat: "ENGINEERING", name: "SDE-3", order: 3 },
    { companyId: flipkart.id, cat: "ENGINEERING", name: "Architect", order: 4 },
    // Zepto Engineering
    { companyId: zepto.id, cat: "ENGINEERING", name: "Associate SDE", order: 1 },
    { companyId: zepto.id, cat: "ENGINEERING", name: "SDE II", order: 2 },
    { companyId: zepto.id, cat: "ENGINEERING", name: "Senior SDE", order: 3 },
    { companyId: zepto.id, cat: "ENGINEERING", name: "Tech Lead", order: 4 },
    // Thoughtworks Engineering
    { companyId: thoughtworks.id, cat: "ENGINEERING", name: "Developer", order: 1 },
    { companyId: thoughtworks.id, cat: "ENGINEERING", name: "Senior Developer", order: 2 },
    { companyId: thoughtworks.id, cat: "ENGINEERING", name: "Lead Developer", order: 3 },
    { companyId: thoughtworks.id, cat: "ENGINEERING", name: "Principal Consultant", order: 4 }
  ];

  const levels: any[] = [];
  for (const lvl of levelsData) {
    const createdLevel = await prisma.level.create({
      data: {
        companyId: lvl.companyId,
        roleCategory: lvl.cat,
        levelName: lvl.name,
        levelOrder: lvl.order
      }
    });
    levels.push(createdLevel);
  }

  // 4. Level Mappings (Equivalencies)
  // Connect Google L4 to Microsoft SDE II
  const googleL4 = levels.find(l => l.companyId === google.id && l.levelName === "L4");
  const msft61 = levels.find(l => l.companyId === microsoft.id && l.levelName === "SDE II (61)");
  if (googleL4 && msft61) {
    await prisma.levelMapping.create({
      data: {
        fromLevelId: googleL4.id,
        toLevelId: msft61.id,
        confidenceScore: 0.95
      }
    });
  }

  // Connect Google L5 to Swiggy SDE 3
  const googleL5 = levels.find(l => l.companyId === google.id && l.levelName === "L5");
  const swiggySde3 = levels.find(l => l.companyId === swiggy.id && l.levelName === "SDE 3");
  if (googleL5 && swiggySde3) {
    await prisma.levelMapping.create({
      data: {
        fromLevelId: googleL5.id,
        toLevelId: swiggySde3.id,
        confidenceScore: 0.88
      }
    });
  }

  // 5. Seed 40+ realistic compensation entries (Indian Rupees context, in Lakhs representation e.g. 18,00,000 to 85,00,000)
  const compSeeds = [
    // Bangalore
    { compName: "Google", lvlName: "L3", roleName: "Software Engineer", city: "Bangalore", base: 1800000, bonus: 250000, equity: 400000, yoe: 1 },
    { compName: "Google", lvlName: "L4", roleName: "Software Engineer", city: "Bangalore", base: 2800000, bonus: 350000, equity: 800000, yoe: 3 },
    { compName: "Google", lvlName: "L5", roleName: "Software Engineer", city: "Bangalore", base: 4200000, bonus: 600000, equity: 1500000, yoe: 6 },
    { compName: "Google", lvlName: "L6", roleName: "Software Engineer", city: "Bangalore", base: 6500000, bonus: 1000000, equity: 2500000, yoe: 10 },

    // Microsoft - Hyderabad
    { compName: "Microsoft", lvlName: "SDE I (59)", roleName: "Software Engineer", city: "Hyderabad", base: 1500000, bonus: 150000, equity: 300000, yoe: 1 },
    { compName: "Microsoft", lvlName: "SDE II (61)", roleName: "Software Engineer", city: "Hyderabad", base: 2400000, bonus: 250000, equity: 600000, yoe: 4 },
    { compName: "Microsoft", lvlName: "Senior SDE (63)", roleName: "Software Engineer", city: "Hyderabad", base: 3800000, bonus: 400000, equity: 1100000, yoe: 8 },
    { compName: "Microsoft", lvlName: "Principal SDE (65)", roleName: "Software Engineer", city: "Hyderabad", base: 5800000, bonus: 800000, equity: 2000000, yoe: 13 },

    // Flipkart - Bangalore
    { compName: "Flipkart", lvlName: "SDE-1", roleName: "Software Engineer", city: "Bangalore", base: 1400000, bonus: 100000, equity: 150000, yoe: 1 },
    { compName: "Flipkart", lvlName: "SDE-2", roleName: "Software Engineer", city: "Bangalore", base: 2200000, bonus: 200000, equity: 300000, yoe: 3 },
    { compName: "Flipkart", lvlName: "SDE-3", roleName: "Software Engineer", city: "Bangalore", base: 3400000, bonus: 350000, equity: 600000, yoe: 7 },
    { compName: "Flipkart", lvlName: "Architect", roleName: "Software Engineer", city: "Bangalore", base: 5200000, bonus: 500000, equity: 1200000, yoe: 11 },

    // Swiggy - Bangalore
    { compName: "Swiggy", lvlName: "SDE 1", roleName: "Backend Developer", city: "Bangalore", base: 1300000, bonus: 100000, equity: 150000, yoe: 1 },
    { compName: "Swiggy", lvlName: "SDE 2", roleName: "Backend Developer", city: "Bangalore", base: 2000000, bonus: 200000, equity: 250000, yoe: 3 },
    { compName: "Swiggy", lvlName: "SDE 3", roleName: "Backend Developer", city: "Bangalore", base: 3200000, bonus: 300000, equity: 500000, yoe: 6 },
    { compName: "Swiggy", lvlName: "Principal", roleName: "Backend Developer", city: "Bangalore", base: 4800000, bonus: 400000, equity: 900000, yoe: 10 },

    // Razorpay - Pune / Bangalore
    { compName: "Razorpay", lvlName: "SDE I", roleName: "Software Engineer", city: "Pune", base: 1250000, bonus: 100000, equity: 100000, yoe: 1 },
    { compName: "Razorpay", lvlName: "SDE II", roleName: "Software Engineer", city: "Bangalore", base: 1950000, bonus: 200000, equity: 250000, yoe: 3 },
    { compName: "Razorpay", lvlName: "Senior SDE", roleName: "Software Engineer", city: "Bangalore", base: 2900000, bonus: 300000, equity: 450000, yoe: 7 },
    { compName: "Razorpay", lvlName: "Lead SDE", roleName: "Software Engineer", city: "Bangalore", base: 4500000, bonus: 450000, equity: 800000, yoe: 11 },

    // Zepto - Mumbai
    { compName: "Zepto", lvlName: "Associate SDE", roleName: "Software Engineer", city: "Mumbai", base: 1200000, bonus: 100000, equity: 80000, yoe: 1 },
    { compName: "Zepto", lvlName: "SDE II", roleName: "Software Engineer", city: "Mumbai", base: 1800000, bonus: 150000, equity: 180000, yoe: 2 },
    { compName: "Zepto", lvlName: "Senior SDE", roleName: "Software Engineer", city: "Mumbai", base: 2800000, bonus: 250000, equity: 400000, yoe: 5 },
    { compName: "Zepto", lvlName: "Tech Lead", roleName: "Software Engineer", city: "Mumbai", base: 4000000, bonus: 350000, equity: 650000, yoe: 9 },

    // Atlassian - Bangalore
    { compName: "Atlassian", lvlName: "P30", roleName: "Software Engineer", city: "Bangalore", base: 1700000, bonus: 170000, equity: 350000, yoe: 1 },
    { compName: "Atlassian", lvlName: "P40", roleName: "Software Engineer", city: "Bangalore", base: 2600000, bonus: 260000, equity: 700000, yoe: 4 },
    { compName: "Atlassian", lvlName: "P50", roleName: "Software Engineer", city: "Bangalore", base: 3800000, bonus: 380000, equity: 1200000, yoe: 8 },
    { compName: "Atlassian", lvlName: "P60", roleName: "Software Engineer", city: "Bangalore", base: 5600000, bonus: 560000, equity: 2200000, yoe: 12 },

    // Thoughtworks - Chennai / Pune
    { compName: "Thoughtworks", lvlName: "Developer", roleName: "Software Engineer", city: "Chennai", base: 850000, bonus: 50000, equity: 0, yoe: 2 },
    { compName: "Thoughtworks", lvlName: "Senior Developer", roleName: "Software Engineer", city: "Pune", base: 1400000, bonus: 100000, equity: 0, yoe: 5 },
    { compName: "Thoughtworks", lvlName: "Lead Developer", roleName: "Software Engineer", city: "Bangalore", base: 2100000, bonus: 150000, equity: 0, yoe: 8 },
    { compName: "Thoughtworks", lvlName: "Principal Consultant", roleName: "Software Engineer", city: "Delhi NCR", base: 3200000, bonus: 300000, equity: 0, yoe: 12 }
  ];

  // Map other entries with realistic noise & categories (Product management, Data science)
  const bonusAndExtraEntries = [
    { compName: "Google", lvlName: "L5", roleName: "Product Manager", city: "Bangalore", base: 3800000, bonus: 500000, equity: 1200000, yoe: 7 },
    { compName: "Microsoft", lvlName: "Senior SDE (63)", roleName: "Product Manager", city: "Hyderabad", base: 3500000, bonus: 350000, equity: 900000, yoe: 8 },
    { compName: "Flipkart", lvlName: "SDE-3", roleName: "Product Manager", city: "Bangalore", base: 3100000, bonus: 300000, equity: 450000, yoe: 7 },
    { compName: "Google", lvlName: "L4", roleName: "Data Scientist", city: "Bangalore", base: 2500000, bonus: 300000, equity: 600000, yoe: 4 },
    { compName: "Microsoft", lvlName: "SDE II (61)", roleName: "Data Scientist", city: "Hyderabad", base: 2200000, bonus: 200000, equity: 450000, yoe: 4 },
    { compName: "Swiggy", lvlName: "SDE 2", roleName: "Product Designer", city: "Bangalore", base: 1800000, bonus: 150000, equity: 180000, yoe: 3 },
    { compName: "Razorpay", lvlName: "SDE II", roleName: "Product Designer", city: "Bangalore", base: 1750000, bonus: 150000, equity: 150000, yoe: 3 },
    { compName: "Atlassian", lvlName: "P40", roleName: "Product Designer", city: "Bangalore", base: 2300000, bonus: 230000, equity: 500000, yoe: 4 },
    { compName: "Thoughtworks", lvlName: "Lead Developer", roleName: "Product Designer", city: "Bangalore", base: 1800000, bonus: 120000, equity: 0, yoe: 7 }
  ];

  const fullSeeds = [...compSeeds, ...bonusAndExtraEntries];

  // Insert seed compensation entries
  for (const c of fullSeeds) {
    const compMatch = companies.find(comp => comp.name === c.compName);
    const roleMatch = roles.find(r => r.name === c.roleName);
    const levelMatch = levels.find(l => l.companyId === compMatch?.id && l.levelName === c.lvlName);

    if (compMatch && roleMatch && levelMatch) {
      const baseVal = c.base;
      const bonusVal = c.bonus;
      const equityVal = c.equity;
      const totalCash = baseVal + bonusVal;
      const totalCompensation = baseVal + bonusVal + equityVal;

      await prisma.compensationEntry.create({
        data: {
          companyId: compMatch.id,
          roleId: roleMatch.id,
          levelId: levelMatch.id,
          locationCity: c.city,
          locationCountry: "India",
          locationRegion: "APAC",
          yearsOfExperience: c.yoe,
          baseSalary: baseVal,
          annualBonus: bonusVal,
          equityValueAnnual: equityVal,
          totalCash: totalCash,
          totalCompensation: totalCompensation,
          currency: "INR",
          offerDate: "June 2026",
          employmentType: "FULLTIME",
          dataSource: "SELF_REPORTED",
          isVerified: Math.random() > 0.15 // 85% verified rates
        }
      });
    }
  }

  console.log("Compensation database tables fully populated with 40+ structured entries!");
}

main()
  .catch((e) => {
    console.error("Error running database seed logic:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
