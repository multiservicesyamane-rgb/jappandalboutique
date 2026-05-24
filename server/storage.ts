import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const BUCKET = "jappandal-media";

let _client: ReturnType<typeof createClient> | null = null;
let _bucketReady = false;

function getClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}

async function ensureBucket(client: ReturnType<typeof createClient>) {
  if (_bucketReady) return;
  const { error } = await client.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.warn("[Storage] Bucket creation warning:", error.message);
  }
  _bucketReady = true;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const client = getClient();

  if (client) {
    await ensureBucket(client);
    const buffer = data instanceof Buffer ? data : Buffer.from(data as any);
    const { error } = await client.storage
      .from(BUCKET)
      .upload(key, buffer, { contentType, upsert: true });
    if (error) throw new Error(`Upload Supabase échoué: ${error.message}`);
    const { data: pub } = client.storage.from(BUCKET).getPublicUrl(key);
    return { key, url: pub.publicUrl };
  }

  // Fallback local pour le développement sans Supabase
  const fullPath = path.join(UPLOADS_DIR, key);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, data instanceof Uint8Array ? Buffer.from(data) : typeof data === "string" ? Buffer.from(data) : data);
  return { key, url: `/uploads/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const client = getClient();

  if (client) {
    const { data: pub } = client.storage.from(BUCKET).getPublicUrl(key);
    return { key, url: pub.publicUrl };
  }

  return { key, url: `/uploads/${key}` };
}

// Convert legacy /uploads/xxx paths stored in DB to full Supabase Storage URLs.
export function resolveImageUrl(raw: string | null | undefined): string | null | undefined {
  if (!raw || !raw.startsWith("/uploads/")) return raw;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return raw;
  const key = raw.replace(/^\/uploads\//, "");
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
}
