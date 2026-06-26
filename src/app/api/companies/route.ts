/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { handleAPIError } from "../../../lib/api-utils";

export async function GET() {
  try {
    const companies = await db.company.findMany({
      include: {
        _count: {
          select: {
            compensations: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      tier: c.tier,
      logoUrl: c.logoUrl,
      createdAt: c.createdAt,
      entries_count: c._count.compensations,
    }));

    return NextResponse.json({
      data: formatted,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
