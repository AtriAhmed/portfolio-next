CREATE TABLE IF NOT EXISTS "about" (
  "_id" UUID PRIMARY KEY,
  "title" TEXT NOT NULL DEFAULT '',
  "content" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "contact" (
  "_id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "lastname" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL DEFAULT '',
  "summary" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "github" TEXT,
  "linkedin" TEXT,
  "x" TEXT,
  "facebook" TEXT,
  "website" TEXT,
  "image" TEXT,
  "cv" TEXT
);
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "cv" TEXT;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "x" TEXT;
ALTER TABLE "contact" ADD COLUMN IF NOT EXISTS "facebook" TEXT;

CREATE TABLE IF NOT EXISTS "education" (
  "_id" UUID PRIMARY KEY,
  "certificate" TEXT NOT NULL DEFAULT '',
  "institute" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS "training" (
  "_id" UUID PRIMARY KEY,
  "title" TEXT NOT NULL DEFAULT '',
  "provider" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
DO $training_migration$
BEGIN
  INSERT INTO "training" ("_id", "title", "provider", "date", "location", "order", "isVisible")
  SELECT "_id", "certificate", "institute", "date", "location", "order", "isVisible"
  FROM "education"
  WHERE "certificate" IN (
    'Online Research Methods and the Use of Metadata in Security Sector Governance',
    'International Protection of Refugees and Advocacy in Asylum Issues',
    'Local Affairs: How to Make Community Issues an Attractive News Story'
  )
  ON CONFLICT ("_id") DO UPDATE SET
    "title" = EXCLUDED."title", "provider" = EXCLUDED."provider", "date" = EXCLUDED."date",
    "location" = EXCLUDED."location", "order" = EXCLUDED."order", "isVisible" = EXCLUDED."isVisible";

  DELETE FROM "education" WHERE "certificate" IN (
    'Online Research Methods and the Use of Metadata in Security Sector Governance',
    'International Protection of Refugees and Advocacy in Asylum Issues',
    'Local Affairs: How to Make Community Issues an Attractive News Story'
  );
END
$training_migration$;

CREATE TABLE IF NOT EXISTS "experiences" (
  "_id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "position" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "category" TEXT NOT NULL DEFAULT 'Professional',
  "description" TEXT NOT NULL DEFAULT '',
  "image" TEXT,
  "showInCV" BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "location" TEXT NOT NULL DEFAULT '';
ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Professional';

CREATE TABLE IF NOT EXISTS "skill_types" (
  "_id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "skills" (
  "_id" UUID PRIMARY KEY,
  "type" UUID NOT NULL REFERENCES "skill_types"("_id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL DEFAULT '',
  "level" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS "skills_type_idx" ON "skills" ("type");

CREATE TABLE IF NOT EXISTS "languages" (
  "_id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT '',
  "level" TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
DO $languages_migration$
BEGIN
  INSERT INTO "languages" ("_id", "name", "level", "order", "isVisible")
  SELECT s."_id", s."name", s."level", s."order", s."isVisible"
  FROM "skills" s
  INNER JOIN "skill_types" t ON t."_id" = s."type"
  WHERE LOWER(TRIM(t."name")) = 'languages'
  ON CONFLICT ("_id") DO UPDATE SET
    "name" = EXCLUDED."name", "level" = EXCLUDED."level", "order" = EXCLUDED."order", "isVisible" = EXCLUDED."isVisible";

  DELETE FROM "skills" s USING "skill_types" t
  WHERE s."type" = t."_id" AND LOWER(TRIM(t."name")) = 'languages';
  DELETE FROM "skill_types" WHERE LOWER(TRIM("name")) = 'languages';
END
$languages_migration$;

CREATE TABLE IF NOT EXISTS "users" (
  "_id" UUID PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "works" (
  "_id" UUID PRIMARY KEY,
  "title" TEXT NOT NULL DEFAULT '',
  "format" TEXT NOT NULL DEFAULT '',
  "outlet" TEXT NOT NULL DEFAULT '',
  "role" TEXT NOT NULL DEFAULT '',
  "date" TEXT NOT NULL DEFAULT '',
  "topic" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "image" TEXT,
  "link" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "format" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "outlet" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "date" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "topic" TEXT NOT NULL DEFAULT '';
ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE;
DO $work_migration$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'works' AND column_name = 'name') THEN
    EXECUTE 'UPDATE "works" SET "title" = "name" WHERE "title" = '''' AND "name" <> ''''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'works' AND column_name = 'technologies') THEN
    EXECUTE 'UPDATE "works" SET "format" = "technologies" WHERE "format" = '''' AND "technologies" <> ''''';
  END IF;
END
$work_migration$;
ALTER TABLE "works" DROP COLUMN IF EXISTS "name";
ALTER TABLE "works" DROP COLUMN IF EXISTS "technologies";
ALTER TABLE "works" DROP COLUMN IF EXISTS "showInCV";

CREATE TABLE IF NOT EXISTS "site_settings" (
  "_id" UUID PRIMARY KEY,
  "siteTitle" TEXT NOT NULL DEFAULT '', "siteDescription" TEXT NOT NULL DEFAULT '',
  "heroEyebrow" TEXT NOT NULL DEFAULT '', "heroCtaLabel" TEXT NOT NULL DEFAULT '', "heroCtaHref" TEXT NOT NULL DEFAULT '', "portraitLabelPrefix" TEXT NOT NULL DEFAULT '',
  "navAboutLabel" TEXT NOT NULL DEFAULT '', "navExperienceLabel" TEXT NOT NULL DEFAULT '', "navEducationLabel" TEXT NOT NULL DEFAULT 'Education', "navWorkLabel" TEXT NOT NULL DEFAULT '', "navSkillsLabel" TEXT NOT NULL DEFAULT '', "navLanguagesLabel" TEXT NOT NULL DEFAULT 'Languages', "navContactLabel" TEXT NOT NULL DEFAULT '', "navCvLabel" TEXT NOT NULL DEFAULT '',
  "experienceKicker" TEXT NOT NULL DEFAULT '', "experienceTitle" TEXT NOT NULL DEFAULT '', "educationKicker" TEXT NOT NULL DEFAULT 'Background', "educationTitle" TEXT NOT NULL DEFAULT 'Education & training', "educationDegreesHeading" TEXT NOT NULL DEFAULT 'Academic education', "educationTrainingHeading" TEXT NOT NULL DEFAULT 'Professional training', "workKicker" TEXT NOT NULL DEFAULT '', "workTitle" TEXT NOT NULL DEFAULT '', "skillsKicker" TEXT NOT NULL DEFAULT '', "skillsTitle" TEXT NOT NULL DEFAULT '', "languagesKicker" TEXT NOT NULL DEFAULT 'Global communication', "languagesTitle" TEXT NOT NULL DEFAULT 'Four languages',
  "contactKicker" TEXT NOT NULL DEFAULT '', "contactTitle" TEXT NOT NULL DEFAULT '', "contactFallbackText" TEXT NOT NULL DEFAULT '',
  "formNameLabel" TEXT NOT NULL DEFAULT '', "formEmailLabel" TEXT NOT NULL DEFAULT '', "formSubjectLabel" TEXT NOT NULL DEFAULT '', "formMessageLabel" TEXT NOT NULL DEFAULT '',
  "formSubmitLabel" TEXT NOT NULL DEFAULT '', "formSendingLabel" TEXT NOT NULL DEFAULT '', "formSuccessTitle" TEXT NOT NULL DEFAULT '', "formSuccessMessage" TEXT NOT NULL DEFAULT '', "formErrorTitle" TEXT NOT NULL DEFAULT '', "formErrorMessage" TEXT NOT NULL DEFAULT '',
  "cvKicker" TEXT NOT NULL DEFAULT '', "cvTitle" TEXT NOT NULL DEFAULT '', "cvContactHeading" TEXT NOT NULL DEFAULT '', "cvEducationHeading" TEXT NOT NULL DEFAULT '', "cvLinksHeading" TEXT NOT NULL DEFAULT '',
  "cvExperienceHeading" TEXT NOT NULL DEFAULT '', "cvProjectsHeading" TEXT NOT NULL DEFAULT '', "cvSkillsHeading" TEXT NOT NULL DEFAULT '', "cvDownloadLabel" TEXT NOT NULL DEFAULT '',
  "footerText" TEXT NOT NULL DEFAULT '', "showExperience" BOOLEAN NOT NULL DEFAULT TRUE, "showEducation" BOOLEAN NOT NULL DEFAULT TRUE, "showWork" BOOLEAN NOT NULL DEFAULT TRUE, "showSkills" BOOLEAN NOT NULL DEFAULT TRUE, "showLanguages" BOOLEAN NOT NULL DEFAULT TRUE, "showContact" BOOLEAN NOT NULL DEFAULT TRUE, "showCv" BOOLEAN NOT NULL DEFAULT TRUE
);
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "navEducationLabel" TEXT NOT NULL DEFAULT 'Education';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "educationKicker" TEXT NOT NULL DEFAULT 'Background';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "educationTitle" TEXT NOT NULL DEFAULT 'Education & training';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "educationDegreesHeading" TEXT NOT NULL DEFAULT 'Academic education';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "educationTrainingHeading" TEXT NOT NULL DEFAULT 'Professional training';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "showEducation" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "navLanguagesLabel" TEXT NOT NULL DEFAULT 'Languages';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "languagesKicker" TEXT NOT NULL DEFAULT 'Global communication';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "languagesTitle" TEXT NOT NULL DEFAULT 'Four languages';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "showLanguages" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "reset_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "rate_limits_reset_at_idx" ON "rate_limits" ("reset_at");

CREATE TABLE IF NOT EXISTS "content_translations" (
  "resource" TEXT NOT NULL,
  "record_id" UUID NOT NULL,
  "locale" TEXT NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY ("resource", "record_id", "locale")
);
CREATE INDEX IF NOT EXISTS "content_translations_locale_idx" ON "content_translations" ("locale", "resource");
