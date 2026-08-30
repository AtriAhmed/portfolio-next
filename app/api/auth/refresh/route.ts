import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth";

export async function POST() {
  const session = await refreshSession();
  if (!session) return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  return NextResponse.json({ user: { id: session.userId, username: session.username } });
}
