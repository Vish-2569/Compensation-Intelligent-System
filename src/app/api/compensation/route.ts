/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { SubmitCompensationSchema } from "../../../lib/validations";
import { handleAPIError, calculatePercentiles } from "../../../lib/api-utils";
import { assessEntryQuality } from "../../../lib/data-quality";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get("company_id") || undefined;
    const roleId = searchParams.get("role_id") || undefined;
    const levelId = searchParams.get("level_id") || undefined;
    const locationCountry = searchParams.get("location_country") || "India";
    const locationCity = searchParams.get("location_city") || undefined;
    const employmentType = searchParams.get("employment_type") || undefined;

    const minYoe = searchParams.get("min_yoe") ? parseInt(searchParams.get("min_yoe")!, 10) : undefined;
    const maxYoe = searchParams.get("max_yoe") ? parseInt(searchParams.get("max_yoe")!, 10) : undefined;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Filters formulation
    const where: any = {
      deletedAt: null,
      locationCountry,
      companyId,
      roleId,
      levelId,
      locationCity,
      employmentType: employmentType || undefined,
      yearsOfExperience: {
        gte: minYoe,
        lte: maxYoe,
      },
    };

    // Execute queries in parallel using Prisma
    const [entries, total] = await db.$transaction([
      db.compensationEntry.findMany({
        where,
        include: {
          company: true,
          role: true,
          level: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.compensationEntry.count({ where }),
    ]);

    // Fetch all matched entries (without pagination) to calculate accurate percentiles
    const allMatchingSums = await db.compensationEntry.findMany({
      where,
      select: {
        baseSalary: true,
        totalCompensation: true,
      },
    });

    const baseSalaries = allMatchingSums.map((e) => Number(e.baseSalary));
    const totalCompensations = allMatchingSums.map((e) => Number(e.totalCompensation));

    const basePercentiles = calculatePercentiles(baseSalaries);
    const totalPercentiles = calculatePercentiles(totalCompensations);

    const maxTotal = totalCompensations.length > 0 ? Math.max(...totalCompensations) : 0;

    return NextResponse.json({
      data: entries.map((entry) => ({
        ...entry,
        baseSalary: Number(entry.baseSalary),
        annualBonus: entry.annualBonus ? Number(entry.annualBonus) : null,
        equityValueAnnual: entry.equityValueAnnual ? Number(entry.equityValueAnnual) : null,
        totalCash: Number(entry.totalCash),
        totalCompensation: Number(entry.totalCompensation),
      })),
      meta: {
        total,
        page,
        limit,
        stats: {
          median_base: basePercentiles.p50,
          median_total: totalPercentiles.p50,
          p25_total: totalPercentiles.p25,
          p75_total: totalPercentiles.p75,
          highest_total: maxTotal,
          count: total,
        },
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Rate limiting middleware should be placed here.
    // Explanation: Rate limiting is highly recommended on this endpoint to prevent denial-of-service
    // and spamming of bad-faith mock data submissions. A token bucket algorithm or sliding window log
    // using a Redis or Upstash client (e.g. 5 submissions per hour per IP) should be configured.

    const body = await request.json();
    const validated = SubmitCompensationSchema.parse(body);

    const baseSalaryDec = validated.baseSalary;
    const bonusDec = validated.annualBonus ?? 0;
    const equityDec = validated.equityValueAnnual ?? 0;

    const totalCash = baseSalaryDec + bonusDec;
    const totalCompensation = totalCash + equityDec;

    // Standard deviation outlier validation (basic heuristic filter)
    // Automated checking for extreme outlier entries (e.g. entries exceeding 12 Crore INR / 120M INR per annum)
    const isVerified = totalCompensation < 120000000;

    const quality = assessEntryQuality(validated);

    const newEntry = await db.compensationEntry.create({
      data: {
        companyId: validated.companyId,
        roleId: validated.roleId,
        levelId: validated.levelId,
        locationCity: validated.locationCity,
        locationCountry: validated.locationCountry,
        locationRegion: validated.locationRegion,
        yearsOfExperience: validated.yearsOfExperience,
        baseSalary: baseSalaryDec,
        annualBonus: bonusDec,
        equityValueAnnual: equityDec,
        totalCash,
        totalCompensation,
        currency: validated.currency,
        offerDate: validated.offerDate,
        employmentType: validated.employmentType,
        dataSource: "SELF_REPORTED",
        isVerified,
        qualityScore: quality.score,
      },
      include: {
        company: true,
        role: true,
        level: true,
      },
    });

    return NextResponse.json(
      {
        ...newEntry,
        baseSalary: Number(newEntry.baseSalary),
        annualBonus: newEntry.annualBonus ? Number(newEntry.annualBonus) : null,
        equityValueAnnual: newEntry.equityValueAnnual ? Number(newEntry.equityValueAnnual) : null,
        totalCash: Number(newEntry.totalCash),
        totalCompensation: Number(newEntry.totalCompensation),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAPIError(error);
  }
}
