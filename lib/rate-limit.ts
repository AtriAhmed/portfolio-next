import { createHash } from "crypto";
import { connectDb } from "@/lib/db";
import { RateLimitModel } from "@/lib/models";

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
  await connectDb();
  const now = new Date();
  const nextReset = new Date(now.getTime() + options.windowMs);
  const key = rateLimitKey(options.namespace, options.identifier);

  const record = await RateLimitModel.findOneAndUpdate(
    { _id: key },
    [{
      $set: {
        count: {
          $cond: [
            { $gt: ["$resetAt", now] },
            { $add: [{ $ifNull: ["$count", 0] }, 1] },
            1,
          ],
        },
        resetAt: { $cond: [{ $gt: ["$resetAt", now] }, "$resetAt", nextReset] },
      },
    }],
    { new: true, upsert: true },
  ).lean<{ count: number; resetAt: Date }>();

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
  await connectDb();
  await RateLimitModel.deleteOne({ _id: rateLimitKey(namespace, identifier) });
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
