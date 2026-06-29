import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { salaryRecordSchema } from "../../../../schemas/salaryRecord.schema";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return false;
    }
    entry.count += 1;
    return true;
  }

  rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  return true;
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload", fields: { body: ["Expected a JSON object"] } }, { status: 400 });
    }

    const parsed = salaryRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const safeBody = {
      companyTier: parsed.data.companyTier,
      companyNameOptional: parsed.data.companyNameOptional ?? null,
      role: parsed.data.role,
      standardLevel: parsed.data.standardLevel,
      baseSalary: parsed.data.baseSalary,
      annualBonus: parsed.data.annualBonus,
      annualStock: parsed.data.annualStock,
      yearsOfExperience: parsed.data.yearsOfExperience,
      officeLocation: parsed.data.officeLocation,
      currency: parsed.data.currency,
      submittedAt: new Date(parsed.data.submittedAt),
    };

    const totalCompensation = safeBody.baseSalary + safeBody.annualBonus + safeBody.annualStock;

    const record = await db.salaryRecord.create({
      data: {
        ...safeBody,
        totalCompensation,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: record.id, totalCompensation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create salary record" }, { status: 500 });
  }
}
