import { randomUUID } from "crypto";
import { query } from "@/lib/db";

export type ResourceName = "about" | "contact" | "education" | "experiences" | "languages" | "skills" | "settings" | "training" | "types" | "work";
export type DatabaseRecord = Record<string, unknown> & { _id: string };

type ResourceDefinition = {
  table: string;
  fields: readonly string[];
  singleton?: boolean;
  ordered?: boolean;
};

export const resources: Record<ResourceName, ResourceDefinition> = {
  about: { table: "about", fields: ["title", "content", "order", "isVisible"], ordered: true },
  contact: { table: "contact", fields: ["name", "lastname", "title", "summary", "email", "phone", "location", "linkedin", "x", "facebook", "website", "image", "cv"], singleton: true },
  education: { table: "education", fields: ["certificate", "institute", "date", "location", "order", "isVisible"], ordered: true },
  experiences: { table: "experiences", fields: ["name", "position", "date", "location", "category", "description", "image", "showInCV", "order", "isVisible"], ordered: true },
  languages: { table: "languages", fields: ["name", "level", "order", "isVisible"], ordered: true },
  skills: { table: "skills", fields: ["name", "level", "type", "order", "isVisible"], ordered: true },
  settings: { table: "site_settings", fields: [
    "siteTitle", "siteDescription", "heroEyebrow", "heroCtaLabel", "heroCtaHref", "portraitLabelPrefix",
    "navAboutLabel", "navExperienceLabel", "navEducationLabel", "navWorkLabel", "navSkillsLabel", "navLanguagesLabel", "navContactLabel", "navCvLabel",
    "experienceKicker", "experienceTitle", "educationKicker", "educationTitle", "educationDegreesHeading", "educationTrainingHeading", "workKicker", "workTitle", "skillsKicker", "skillsTitle", "languagesKicker", "languagesTitle",
    "contactKicker", "contactTitle", "contactFallbackText", "formNameLabel", "formEmailLabel", "formSubjectLabel", "formMessageLabel",
    "formSubmitLabel", "formSendingLabel", "formSuccessTitle", "formSuccessMessage", "formErrorTitle", "formErrorMessage",
    "cvKicker", "cvTitle", "cvContactHeading", "cvEducationHeading", "cvLinksHeading", "cvExperienceHeading", "cvProjectsHeading",
    "cvSkillsHeading", "cvDownloadLabel", "footerText", "showExperience", "showEducation", "showWork", "showSkills", "showLanguages", "showContact", "showCv",
  ], singleton: true },
  training: { table: "training", fields: ["title", "provider", "date", "location", "order", "isVisible"], ordered: true },
  types: { table: "skill_types", fields: ["name", "order", "isVisible"], ordered: true },
  work: { table: "works", fields: ["title", "format", "outlet", "role", "date", "topic", "description", "image", "link", "isFeatured", "order", "isVisible"], ordered: true },
};

export function isResourceName(value: string): value is ResourceName {
  return value in resources;
}

export function cleanResourceData(resource: ResourceName, input: Record<string, unknown>) {
  const fields = new Set(resources[resource].fields);
  return Object.fromEntries(Object.entries(input).filter(([field, value]) => fields.has(field) && value !== undefined));
}

export async function listRecords(resource: ResourceName) {
  const definition = resources[resource];
  const order = definition.ordered ? ` ORDER BY "order" ASC, "_id" ASC` : "";
  return (await query<DatabaseRecord>(`SELECT * FROM ${identifier(definition.table)}${order}`)).rows;
}

export async function firstRecord(resource: ResourceName) {
  const definition = resources[resource];
  return (await query<DatabaseRecord>(`SELECT * FROM ${identifier(definition.table)} ORDER BY "_id" ASC LIMIT 1`)).rows[0] ?? null;
}

export async function findRecord(resource: ResourceName, id: string) {
  const table = identifier(resources[resource].table);
  return (await query<DatabaseRecord>(`SELECT * FROM ${table} WHERE "_id" = $1`, [id])).rows[0] ?? null;
}

export async function createRecord(resource: ResourceName, input: Record<string, unknown>) {
  const data = cleanResourceData(resource, input);
  const entries = Object.entries(data);
  const columns = ["_id", ...entries.map(([field]) => field)];
  const values = [randomUUID(), ...entries.map(([, value]) => value)];
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const result = await query<DatabaseRecord>(
    `INSERT INTO ${identifier(resources[resource].table)} (${columns.map(identifier).join(", ")}) VALUES (${placeholders}) RETURNING *`,
    values,
  );
  return result.rows[0];
}

export async function upsertSingleton(resource: ResourceName, input: Record<string, unknown>) {
  const existing = await firstRecord(resource);
  return existing ? updateRecord(resource, existing._id, input) : createRecord(resource, input);
}

export async function updateRecord(resource: ResourceName, id: string, input: Record<string, unknown>) {
  const entries = Object.entries(cleanResourceData(resource, input));
  if (entries.length === 0) return findRecord(resource, id);
  const assignments = entries.map(([field], index) => `${identifier(field)} = $${index + 2}`).join(", ");
  const values = [id, ...entries.map(([, value]) => value)];
  return (await query<DatabaseRecord>(
    `UPDATE ${identifier(resources[resource].table)} SET ${assignments} WHERE "_id" = $1 RETURNING *`,
    values,
  )).rows[0] ?? null;
}

export async function deleteRecord(resource: ResourceName, id: string) {
  return (await query<DatabaseRecord>(
    `DELETE FROM ${identifier(resources[resource].table)} WHERE "_id" = $1 RETURNING *`,
    [id],
  )).rows[0] ?? null;
}

export async function countRecords(resource: ResourceName, filter?: { field: string; value: unknown }) {
  const definition = resources[resource];
  const allowedFields = new Set(definition.fields);
  if (filter && !allowedFields.has(filter.field)) throw new Error("INVALID_FILTER");
  const where = filter ? ` WHERE ${identifier(filter.field)} = $1` : "";
  const values = filter ? [filter.value] : [];
  const result = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${identifier(definition.table)}${where}`, values);
  return Number(result.rows[0]?.count ?? 0);
}

export async function recordExists(resource: ResourceName, field: string, value: unknown) {
  return (await countRecords(resource, { field, value })) > 0;
}

function identifier(value: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error("INVALID_IDENTIFIER");
  return `"${value}"`;
}
