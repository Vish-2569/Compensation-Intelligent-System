/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { handleAPIError } from "../../../lib/api-utils";

const roleCategories = ["ENGINEERING", "PRODUCT", "DESIGN", "DATA"] as const;

type RoleCategory = (typeof roleCategories)[number];

export async function GET() {
  try {
    const roles = await db.role.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Grouping roles by category
    const grouped: Record<string, typeof roles> = {} as any;
    
    // Initialize all categories with empty arrays
    roleCategories.forEach((cat) => {
      grouped[cat] = [];
    });

    roles.forEach((role) => {
      if (grouped[role.category]) {
        grouped[role.category].push(role);
      }
    });

    return NextResponse.json({
      data: grouped,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
