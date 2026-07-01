import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL, log: ['error'] });
try {
  await db.$connect();
  const result = await db.$queryRaw`SELECT 1 AS ok`;
  console.log(JSON.stringify({ ok: result[0]?.ok ?? 0 }));
} finally {
  await db.$disconnect();
}
