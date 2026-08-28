import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { clearRateLimit, consumeRateLimit, rateLimitHeaders, requestIdentifier } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(5).max(200),
});

export async function POST(request: Request) {
  try {
    const credentials = credentialsSchema.parse(await request.json());
    const ip = requestIdentifier(request);
    const normalizedUsername = credentials.username.toLowerCase();
    const [ipLimit, accountLimit] = await Promise.all([
      consumeRateLimit({ namespace: "login-ip", identifier: ip, limit: 10, windowMs: 15 * 60_000 }),
      consumeRateLimit({ namespace: "login-account", identifier: normalizedUsername, limit: 5, windowMs: 15 * 60_000 }),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed) {
      const result = !ipLimit.allowed ? ipLimit : accountLimit;
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(result) },
      );
    }
    const user = (await query<{ _id: string; username: string; password: string }>(
      `SELECT "_id", "username", "password" FROM "users" WHERE "username" = $1 LIMIT 1`,
      [credentials.username],
    )).rows[0];
    if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401, headers: rateLimitHeaders(accountLimit) },
      );
    }
    await Promise.all([
      clearRateLimit("login-ip", ip),
      clearRateLimit("login-account", normalizedUsername),
    ]);
    await createSession(String(user._id), user.username);
    return NextResponse.json({ user: { id: String(user._id), username: user.username } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Please enter valid credentials." }, { status: 400 });
    }
    console.error("Login failed", error);
    return NextResponse.json({ message: "Unable to sign in." }, { status: 500 });
  }
}
