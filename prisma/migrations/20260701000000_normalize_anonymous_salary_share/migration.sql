-- AlterTable
ALTER TABLE "compensation_entries" ADD COLUMN "location_id" TEXT,
ADD COLUMN "submitted_by_id" TEXT;

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Unknown',
    "region" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'Unknown',
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_statistics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "role_id" TEXT,
    "level_id" TEXT,
    "location_id" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "observation_window_start" TIMESTAMP(3),
    "observation_window_end" TIMESTAMP(3),
    "sample_size" INTEGER NOT NULL DEFAULT 0,
    "average_total_compensation" DOUBLE PRECISION,
    "median_total_compensation" DOUBLE PRECISION,
    "min_total_compensation" DOUBLE PRECISION,
    "max_total_compensation" DOUBLE PRECISION,
    "percentile_25" DOUBLE PRECISION,
    "percentile_75" DOUBLE PRECISION,
    "distribution" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_analytics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "role_id" TEXT,
    "level_id" TEXT,
    "location_id" TEXT,
    "period_key" TEXT,
    "submission_count" INTEGER NOT NULL DEFAULT 0,
    "verified_submission_count" INTEGER NOT NULL DEFAULT 0,
    "average_total_compensation" DOUBLE PRECISION,
    "median_total_compensation" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_analytics_pkey" PRIMARY KEY ("id")
);

-- Backfill normalized locations from existing compensation data
INSERT INTO "locations" ("id", "city", "region", "country", "display_name", "created_at", "updated_at")
SELECT gen_random_uuid(), x.city, x.region, x.country, NULL, NOW(), NOW()
FROM (
    SELECT DISTINCT "location_city" AS city, "location_region" AS region, "location_country" AS country
    FROM "compensation_entries"
) x
ON CONFLICT ("country", "region", "city") DO NOTHING;

-- Link existing compensation entries to normalized location records
UPDATE "compensation_entries" ce
SET "location_id" = l."id"
FROM "locations" l
WHERE ce."location_id" IS NULL
  AND l."country" = ce."location_country"
  AND l."region" = ce."location_region"
  AND l."city" = ce."location_city";

-- CreateIndex
CREATE INDEX "locations_country_region_city_idx" ON "locations"("country", "region", "city");

-- CreateIndex
CREATE UNIQUE INDEX "locations_country_region_city_key" ON "locations"("country", "region", "city");

-- CreateIndex
CREATE INDEX "market_statistics_company_id_role_id_level_id_location_id_c_idx" ON "market_statistics"("company_id", "role_id", "level_id", "location_id", "currency", "created_at");

-- CreateIndex
CREATE INDEX "market_statistics_company_id_created_at_idx" ON "market_statistics"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "market_statistics_role_id_created_at_idx" ON "market_statistics"("role_id", "created_at");

-- CreateIndex
CREATE INDEX "submission_analytics_company_id_role_id_location_id_period__idx" ON "submission_analytics"("company_id", "role_id", "location_id", "period_key");

-- CreateIndex
CREATE INDEX "submission_analytics_submission_count_idx" ON "submission_analytics"("submission_count");

-- CreateIndex
CREATE UNIQUE INDEX "submission_analytics_company_id_role_id_level_id_location_i_key" ON "submission_analytics"("company_id", "role_id", "level_id", "location_id", "period_key");

-- CreateIndex
CREATE INDEX "compensation_entries_company_id_role_id_level_id_location_i_idx" ON "compensation_entries"("company_id", "role_id", "level_id", "location_id", "is_verified", "total_compensation");

-- CreateIndex
CREATE INDEX "compensation_entries_company_id_role_id_location_id_idx" ON "compensation_entries"("company_id", "role_id", "location_id");

-- CreateIndex
CREATE INDEX "compensation_entries_submitted_by_id_idx" ON "compensation_entries"("submitted_by_id");

-- CreateIndex
CREATE INDEX "compensation_entries_is_verified_total_compensation_idx" ON "compensation_entries"("is_verified", "total_compensation");

-- CreateIndex
CREATE INDEX "compensation_entries_created_at_idx" ON "compensation_entries"("created_at");

-- CreateIndex
CREATE INDEX "levels_company_id_role_category_level_order_idx" ON "levels"("company_id", "role_category", "level_order");

-- AddForeignKey
ALTER TABLE "compensation_entries" ADD CONSTRAINT "compensation_entries_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_entries" ADD CONSTRAINT "compensation_entries_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_statistics" ADD CONSTRAINT "market_statistics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_statistics" ADD CONSTRAINT "market_statistics_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_statistics" ADD CONSTRAINT "market_statistics_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_statistics" ADD CONSTRAINT "market_statistics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;