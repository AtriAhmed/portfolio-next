import { Pool, type PoolClient, type QueryResultRow } from "pg";

type PgCache = { pool?: Pool };
const globalForPg = globalThis as typeof globalThis & { pgCache?: PgCache };
const cache = globalForPg.pgCache ?? {};
globalForPg.pgCache = cache;

export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  if (!cache.pool) {
    cache.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      application_name: "zayani-portfolio",
    });
    cache.pool.on("error", (error) => console.error("Unexpected PostgreSQL pool error", error));
  }
  return cache.pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return database().query<T>(text, values);
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
