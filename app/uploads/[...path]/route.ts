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
  ".pdf": "application/pdf",
  ".webp": "image/webp",
};

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
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
    const download = new URL(request.url).searchParams.get("download") === "1";
    const requestedFilename = new URL(request.url).searchParams.get("filename") ?? "cv.pdf";
    const filename = sanitizeFilename(requestedFilename);
    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Type": contentType,
        ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

function sanitizeFilename(value: string) {
  const filename = value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").slice(0, 120);
  return filename.toLowerCase().endsWith(".pdf") ? filename : `${filename || "cv"}.pdf`;
}
