import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { uploadsRoot } from "@/lib/uploads";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  const root = uploadsRoot();
  const requestedPath = path.resolve(root, ...segments);

  if (!requestedPath.startsWith(`${root}${path.sep}`)) {
    return NextResponse.json({ message: "Invalid upload path." }, { status: 400 });
  }

  const contentType = contentTypes[path.extname(requestedPath).toLowerCase()];
  if (!contentType) return new NextResponse(null, { status: 404 });

  try {
    const file = await readFile(requestedPath);
    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
