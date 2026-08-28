import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
const directory = path.dirname(fileURLToPath(import.meta.url));
const sql = await readFile(path.join(directory, "../database/schema.sql"), "utf8");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(sql);
  console.log("PostgreSQL schema is up to date.");
} finally {
  await pool.end();
}
