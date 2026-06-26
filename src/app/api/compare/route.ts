/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { handleAPIError, calculatePercentiles } from "../../../lib/api-utils";
import { z } from "zod";

const SlotSchema = z.object({
  company_id: z.string().uuid(),
  level_id: z.string().uuid(),
  location_city: z.string().optional()
});

const ComparePayloadSchema = z.object({
  slot_a: SlotSchema,
  slot_b: SlotSchema
});

async function getSlotStats(companyId: string, levelId: string, city?: string) {
  const where: any = {
    companyId,
    levelId,
    deletedAt: null
  };
  if (city) {
    where.locationCity = city;
  }

  const entries = await db.compensationEntry.findMany({
    where,
    select: {
      baseSalary: true,
      totalCompensation: true
    }
  });

  const levelInfo = await db.level.findUnique({
    where: { id: levelId },
    include: { company: true }
  });

  const label = levelInfo 
    ? `${levelInfo.company.name} - ${levelInfo.levelName}`
    : "Unknown Level";

  const baseSalaries = entries.map(e => Number(e.baseSalary));
  const totalCompensations = entries.map(e => Number(e.totalCompensation));

  const basePercentiles = calculatePercentiles(baseSalaries);
  const totalPercentiles = calculatePercentiles(totalCompensations);

  return {
    label,
    stats: {
      median_base: basePercentiles.p50,
      median_total: totalPercentiles.p50,
      p25: totalPercentiles.p25,
      p75: totalPercentiles.p75,
      sample_count: entries.length
    }
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ComparePayloadSchema.parse(body);

    const [slot_a_results, slot_b_results] = await Promise.all([
      getSlotStats(validated.slot_a.company_id, validated.slot_a.level_id, validated.slot_a.location_city),
      getSlotStats(validated.slot_b.company_id, validated.slot_b.level_id, validated.slot_b.location_city)
    ]);

    const base_diff = slot_b_results.stats.median_base - slot_a_results.stats.median_base;
    const base_diff_pct = slot_a_results.stats.median_base > 0
      ? Number(((base_diff / slot_a_results.stats.median_base) * 100).toFixed(2))
      : 0;

    const total_diff = slot_b_results.stats.median_total - slot_a_results.stats.median_total;
    const total_diff_pct = slot_a_results.stats.median_total > 0
      ? Number(((total_diff / slot_a_results.stats.median_total) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      slot_a: slot_a_results,
      slot_b: slot_b_results,
      delta: {
        base_diff,
        base_diff_pct,
        total_diff,
        total_diff_pct
      }
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
