import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const allowedImageTypes: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function uploadsRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads"));
}

export async function saveUploadedImage(file: File) {
  const extension = allowedImageTypes[file.type];
  if (!extension || file.size === 0 || file.size > 5_000_000) {
    throw new Error("INVALID_IMAGE");
  }

  const filename = `${randomUUID()}${extension}`;
  const directory = path.join(uploadsRoot(), "images");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  return `uploads/images/${filename}`;
}

export async function deleteManagedUpload(value: string) {
  const normalized = value.replace(/^\/+/, "");
  if (!normalized.startsWith("uploads/")) return false;

  const root = uploadsRoot();
  const filePath = path.resolve(root, normalized.slice("uploads/".length));
  if (!filePath.startsWith(`${root}${path.sep}`)) return false;

  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Could not delete managed upload", { filePath, error });
    }
    return false;
  }
}
