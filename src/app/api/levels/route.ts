/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { handleAPIError } from "../../../lib/api-utils";

const validRoleCategories = ["ENGINEERING", "PRODUCT", "DESIGN", "DATA"] as const;

type RoleCategory = (typeof validRoleCategories)[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id") || undefined;
    const roleCategoryStr = searchParams.get("role_category") || undefined;

    let roleCategory: RoleCategory | undefined = undefined;
    if (roleCategoryStr && validRoleCategories.includes(roleCategoryStr as RoleCategory)) {
      roleCategory = roleCategoryStr as RoleCategory;
    }

    const levels = await db.level.findMany({
      where: {
        companyId,
        roleCategory,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
          },
        },
      },
      orderBy: [
        { companyId: "asc" },
        { levelOrder: "asc" },
      ],
    });

    return NextResponse.json({
      data: levels,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
