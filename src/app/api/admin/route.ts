/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { handleAPIError } from "../../../lib/api-utils";

function checkAuth(request: Request): boolean {
  const adminToken = process.env.ADMIN_TOKEN || "admin-secret";
  const headerToken = request.headers.get("x-admin-token") || request.headers.get("Authorization");
  return headerToken === adminToken;
}

export async function GET(request: Request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total active entries
    const totalCount = await db.compensationEntry.count({
      where: { deletedAt: null },
    });

    // 2. Entries by company
    const companyStats = await db.company.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
        _count: {
          select: {
            compensations: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    const companyData = companyStats
      .map((c) => ({
        id: c.id,
        name: c.name,
        tier: c.tier,
        count: c._count.compensations,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    // 3. Entries by city
    const cityStats = await db.compensationEntry.groupBy({
      by: ["locationCity"],
      where: { deletedAt: null },
      _count: {
        id: true,
      },
    });

    const cityData = cityStats
      .map((c) => ({
        city: c.locationCity,
        count: c._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Recent submissions (last 10)
    const recentSubmissions = await db.compensationEntry.findMany({
      where: { deletedAt: null },
      take: 10,
      include: {
        company: true,
        role: true,
        level: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedRecent = recentSubmissions.map((entry) => ({
      ...entry,
      baseSalary: Number(entry.baseSalary),
      annualBonus: entry.annualBonus ? Number(entry.annualBonus) : null,
      equityValueAnnual: entry.equityValueAnnual ? Number(entry.equityValueAnnual) : null,
      totalCash: Number(entry.totalCash),
      totalCompensation: Number(entry.totalCompensation),
    }));

    return NextResponse.json({
      totalCount,
      companies: companyData,
      cities: cityData,
      recent: formattedRecent,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
