-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "auth_provider" TEXT NOT NULL DEFAULT 'email',
    "google_id" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "resume_url" TEXT,
    "reports_submitted" INTEGER NOT NULL DEFAULT 0,
    "negotiations_created" INTEGER NOT NULL DEFAULT 0,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "current_job_title" TEXT,
    "experience_years" INTEGER,
    "company_name" TEXT,
    "country" TEXT,
    "preferred_currency" TEXT,
    "expected_salary" INTEGER,
    "preferred_location" TEXT,
    "verification_token" TEXT,
    "verification_token_expires_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'OTHER',
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_category" TEXT NOT NULL DEFAULT 'OTHER',
    "level_name" TEXT NOT NULL,
    "level_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "compensation_entries" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level_id" TEXT NOT NULL,
    "location_id" TEXT,
    "submitted_by_id" TEXT,
    "location_city" TEXT NOT NULL,
    "location_country" TEXT NOT NULL,
    "location_region" TEXT NOT NULL,
    "years_of_experience" INTEGER NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL,
    "annual_bonus" DOUBLE PRECISION,
    "equity_value_annual" DOUBLE PRECISION,
    "total_cash" DOUBLE PRECISION NOT NULL,
    "total_compensation" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "offer_date" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL DEFAULT 'FULLTIME',
    "data_source" TEXT NOT NULL DEFAULT 'SELF_REPORTED',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "quality_score" INTEGER NOT NULL DEFAULT 100,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compensation_entries_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "level_mappings" (
    "id" TEXT NOT NULL,
    "from_level_id" TEXT NOT NULL,
    "to_level_id" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_records" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "company_tier" TEXT NOT NULL,
    "company_name_optional" TEXT,
    "role" TEXT NOT NULL,
    "standard_level" TEXT NOT NULL,
    "base_salary" INTEGER NOT NULL,
    "annual_bonus" INTEGER NOT NULL,
    "annual_stock" INTEGER NOT NULL,
    "years_of_experience" INTEGER NOT NULL,
    "office_location" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "total_compensation" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "levels_company_id_role_category_level_order_idx" ON "levels"("company_id", "role_category", "level_order");

-- CreateIndex
CREATE UNIQUE INDEX "levels_company_id_role_category_level_name_key" ON "levels"("company_id", "role_category", "level_name");

-- CreateIndex
CREATE INDEX "locations_country_region_city_idx" ON "locations"("country", "region", "city");

-- CreateIndex
CREATE UNIQUE INDEX "locations_country_region_city_key" ON "locations"("country", "region", "city");

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
CREATE INDEX "compensation_entries_location_country_location_city_idx" ON "compensation_entries"("location_country", "location_city");

-- CreateIndex
CREATE INDEX "compensation_entries_years_of_experience_idx" ON "compensation_entries"("years_of_experience");

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
CREATE UNIQUE INDEX "level_mappings_from_level_id_to_level_id_key" ON "level_mappings"("from_level_id", "to_level_id");

-- CreateIndex
CREATE INDEX "salary_records_company_tier_idx" ON "salary_records"("company_tier");

-- CreateIndex
CREATE INDEX "salary_records_role_idx" ON "salary_records"("role");

-- CreateIndex
CREATE INDEX "salary_records_standard_level_idx" ON "salary_records"("standard_level");

-- CreateIndex
CREATE INDEX "salary_records_office_location_idx" ON "salary_records"("office_location");

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_entries" ADD CONSTRAINT "compensation_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_entries" ADD CONSTRAINT "compensation_entries_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_entries" ADD CONSTRAINT "compensation_entries_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "level_mappings" ADD CONSTRAINT "level_mappings_from_level_id_fkey" FOREIGN KEY ("from_level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_mappings" ADD CONSTRAINT "level_mappings_to_level_id_fkey" FOREIGN KEY ("to_level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

