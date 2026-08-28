import { createHash } from "crypto";
import { query } from "@/lib/db";

type RateLimitOptions = {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter: number;
};

export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const now = new Date();
  const nextReset = new Date(now.getTime() + options.windowMs);
  const key = rateLimitKey(options.namespace, options.identifier);

  const record = (await query<{ count: number; resetAt: Date }>(
    `INSERT INTO "rate_limits" ("key", "count", "reset_at") VALUES ($1, 1, $2)
     ON CONFLICT ("key") DO UPDATE SET
       "count" = CASE WHEN "rate_limits"."reset_at" > $3 THEN "rate_limits"."count" + 1 ELSE 1 END,
       "reset_at" = CASE WHEN "rate_limits"."reset_at" > $3 THEN "rate_limits"."reset_at" ELSE $2 END
     RETURNING "count", "reset_at" AS "resetAt"`,
    [key, nextReset, now],
  )).rows[0];
  void query(`DELETE FROM "rate_limits" WHERE "reset_at" < NOW() - INTERVAL '1 day'`).catch((error) => {
    console.error("Could not clean expired rate limits", error);
  });

  const count = record?.count ?? 1;
  const resetAt = new Date(record?.resetAt ?? nextReset);
  return {
    allowed: count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - count),
    resetAt,
    retryAfter: Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000)),
  };
}

export async function clearRateLimit(namespace: string, identifier: string) {
  await query(`DELETE FROM "rate_limits" WHERE "key" = $1`, [rateLimitKey(namespace, identifier)]);
}

export function requestIdentifier(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedIp || "unknown";
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers({
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt.getTime() / 1000)),
  });
  if (!result.allowed) headers.set("Retry-After", String(result.retryAfter));
  return headers;
}

function rateLimitKey(namespace: string, identifier: string) {
  const digest = createHash("sha256").update(identifier.trim().toLowerCase()).digest("hex");
  return `${namespace}:${digest}`;
}
