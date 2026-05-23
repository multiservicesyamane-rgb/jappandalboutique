import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const fullPath = path.join(UPLOADS_DIR, key);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, data instanceof Uint8Array ? Buffer.from(data) : data);
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  return { key, url: `/uploads/${key}` };
}
