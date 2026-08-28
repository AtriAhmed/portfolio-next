import { randomUUID } from "crypto";
import { lookup } from "dns/promises";
import { mkdir, unlink, writeFile } from "fs/promises";
import { isIP } from "net";
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

  return saveImageBuffer(Buffer.from(await file.arrayBuffer()), extension);
}

export async function importImageFromUrl(value: string) {
  const response = await fetchPublicImage(value);
  const type = response.headers.get("content-type")?.split(";", 1)[0].toLowerCase() ?? "";
  const extension = allowedImageTypes[type];
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (!extension || (contentLength && (!Number.isFinite(contentLength) || contentLength > 5_000_000))) {
    throw new Error("INVALID_IMAGE_URL");
  }

  const contents = await readResponse(response, 5_000_000);
  if (contents.length === 0) throw new Error("INVALID_IMAGE_URL");
  return saveImageBuffer(contents, extension);
}

async function saveImageBuffer(contents: Buffer, extension: string) {
  const filename = `${randomUUID()}${extension}`;
  const directory = path.join(uploadsRoot(), "images");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), contents, { flag: "wx" });

  return `uploads/images/${filename}`;
}

async function fetchPublicImage(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("INVALID_IMAGE_URL");
  }

  for (let redirects = 0; redirects <= 3; redirects += 1) {
    await assertPublicUrl(url);
    let response: Response;
    try {
      response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
    } catch {
      throw new Error("INVALID_IMAGE_URL");
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("INVALID_IMAGE_URL");
      try {
        url = new URL(location, url);
      } catch {
        throw new Error("INVALID_IMAGE_URL");
      }
      continue;
    }
    if (!response.ok) throw new Error("INVALID_IMAGE_URL");
    return response;
  }
  throw new Error("INVALID_IMAGE_URL");
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("INVALID_IMAGE_URL");
  if (!url.hostname || url.username || url.password) throw new Error("INVALID_IMAGE_URL");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true }).catch(() => []);
  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) throw new Error("INVALID_IMAGE_URL");
}

function isPublicAddress(address: string) {
  if (isIP(address) === 4) {
    const [first, second] = address.split(".").map(Number);
    return first !== 0 && first !== 10 && first !== 127 && !(first === 169 && second === 254) && !(first === 100 && second >= 64 && second <= 127) && !(first === 172 && second >= 16 && second <= 31) && !(first === 192 && second === 168) && !(first === 198 && (second === 18 || second === 19)) && first < 224;
  }
  const normalized = address.toLowerCase();
  return normalized !== "::" && normalized !== "::1" && !normalized.startsWith("fc") && !normalized.startsWith("fd") && !normalized.startsWith("fe80:") && !normalized.startsWith("::ffff:127.") && !normalized.startsWith("::ffff:10.") && !normalized.startsWith("::ffff:192.168.");
}

async function readResponse(response: Response, maximumBytes: number) {
  if (!response.body) throw new Error("INVALID_IMAGE_URL");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) throw new Error("INVALID_IMAGE_URL");
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

export async function saveUploadedPdf(file: File) {
  if (file.type !== "application/pdf" || file.size === 0 || file.size > 10_000_000) {
    throw new Error("INVALID_PDF");
  }

  const contents = Buffer.from(await file.arrayBuffer());
  if (contents.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("INVALID_PDF");

  const filename = `${randomUUID()}.pdf`;
  const directory = path.join(uploadsRoot(), "documents");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), contents, { flag: "wx" });
  return `uploads/documents/${filename}`;
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
