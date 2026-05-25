import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { storagePut } from "../server/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const UPLOADS_DIR = join(ROOT, "uploads", "products");

const files = readdirSync(UPLOADS_DIR);
console.log(`Uploading ${files.length} images to Supabase Storage...\n`);

let ok = 0, fail = 0;
for (const filename of files) {
  try {
    const data = readFileSync(join(UPLOADS_DIR, filename));
    const { url } = await storagePut(`products/${filename}`, data, "image/jpeg");
    console.log(`✓ ${filename} → ${url}`);
    ok++;
  } catch (e: any) {
    console.error(`✗ ${filename}: ${e.message}`);
    fail++;
  }
}

console.log(`\n✅ ${ok} uploaded, ${fail} failed`);
