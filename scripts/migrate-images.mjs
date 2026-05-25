import { StorageClient } from "@supabase/storage-js";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const UPLOADS_DIR = join(ROOT, "uploads", "products");

const SUPABASE_URL = "https://pjejsxrycfgdwlqbhtwt.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "VOTRE_CLE_SECRETE_ICI";
const BUCKET = "jappandal-media";

const storage = new StorageClient(`${SUPABASE_URL}/storage/v1`, {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
});

async function uploadOne(filename, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const data = readFileSync(join(UPLOADS_DIR, filename));
      const { error } = await storage.from(BUCKET).upload(`products/${filename}`, data, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (error) throw new Error(error.message);
      return true;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

const files = readdirSync(UPLOADS_DIR);
console.log(`Uploading ${files.length} images (with retry)...\n`);

let ok = 0, fail = 0;
for (const filename of files) {
  try {
    await uploadOne(filename);
    console.log(`✓ ${filename}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${filename}: ${e.message}`);
    fail++;
  }
}

console.log(`\n✅ ${ok} uploaded, ${fail} failed`);
