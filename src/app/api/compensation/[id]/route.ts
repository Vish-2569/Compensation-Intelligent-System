/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { handleAPIError } from "../../../../lib/api-utils";

function checkAuth(request: Request): boolean {
  const adminToken = process.env.ADMIN_TOKEN || "admin-secret";
  const headerToken = request.headers.get("x-admin-token");
  return headerToken === adminToken;
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await (context.params as any);
    const id = resolvedParams.id;

    const entry = await db.compensationEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Compensation entry not found" }, { status: 404 });
    }

    await db.compensationEntry.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Entry soft-deleted successfully" });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await (context.params as any);
    const id = resolvedParams.id;

    const entry = await db.compensationEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Compensation entry not found" }, { status: 404 });
    }

    const updated = await db.compensationEntry.update({
      where: { id },
      data: {
        isVerified: !entry.isVerified,
      },
      include: {
        company: true,
        role: true,
        level: true,
      },
    });

    return NextResponse.json({
      ...updated,
      baseSalary: Number(updated.baseSalary),
      annualBonus: updated.annualBonus ? Number(updated.annualBonus) : null,
      equityValueAnnual: updated.equityValueAnnual ? Number(updated.equityValueAnnual) : null,
      totalCash: Number(updated.totalCash),
      totalCompensation: Number(updated.totalCompensation),
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
