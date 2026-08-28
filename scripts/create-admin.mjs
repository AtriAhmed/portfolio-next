import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const { DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not configured");
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters.");
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
try {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.query(
    `INSERT INTO "users" ("_id", "username", "password") VALUES ($1, $2, $3)
     ON CONFLICT ("username") DO UPDATE SET "password" = EXCLUDED."password"`,
    [randomUUID(), ADMIN_USERNAME, password],
  );
  console.log(`Administrator ${ADMIN_USERNAME} is ready.`);
} finally {
  await pool.end();
}
