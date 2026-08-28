import { query } from "@/lib/db";
import type { DatabaseRecord, ResourceName } from "@/lib/content-repository";
import type { AppLocale } from "@/i18n/routing";
import { cleanTranslationData } from "@/lib/i18n-fields";

export async function localizeRecords(resource: ResourceName, records: DatabaseRecord[], locale: AppLocale) {
  if (locale === "en" || records.length === 0) return records;
  const ids = records.map((record) => record._id);
  const result = await query<{ record_id: string; data: Record<string, unknown> }>(
    `SELECT "record_id", "data" FROM "content_translations" WHERE "resource" = $1 AND "locale" = $2 AND "record_id" = ANY($3::uuid[])`,
    [resource, locale, ids],
  );
  const translations = new Map(result.rows.map((row) => [row.record_id, row.data]));
  return records.map((record) => ({ ...record, ...(translations.get(record._id) ?? {}) }));
}

export async function localizeRecord(resource: ResourceName, record: DatabaseRecord | null, locale: AppLocale) {
  if (!record) return null;
  return (await localizeRecords(resource, [record], locale))[0];
}

export async function upsertTranslation(resource: ResourceName, recordId: string, locale: Exclude<AppLocale, "en">, input: Record<string, unknown>) {
  const data = cleanTranslationData(resource, input);
  await query(
    `INSERT INTO "content_translations" ("resource", "record_id", "locale", "data") VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT ("resource", "record_id", "locale") DO UPDATE SET "data" = EXCLUDED."data"`,
    [resource, recordId, locale, JSON.stringify(data)],
  );
  return data;
}

export async function deleteTranslations(resource: ResourceName, recordId: string) {
  await query(`DELETE FROM "content_translations" WHERE "resource" = $1 AND "record_id" = $2`, [resource, recordId]);
}
