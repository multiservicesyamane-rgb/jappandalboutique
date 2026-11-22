// Envoie le contenu de pjejsxrycfgdwlqbhtwt.storage.zip vers le bucket du NOUVEAU projet Supabase
// Usage : node scripts/migrate-storage.mjs
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "jappandal-media";
const ZIP = path.resolve("pjejsxrycfgdwlqbhtwt.storage.zip");
const OUT = path.resolve("storage-export");
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY manquant dans .env");

if (!fs.existsSync(OUT)) {
  execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${ZIP}' -DestinationPath '${OUT}' -Force"`, { stdio: "inherit" });
}
const root = path.join(OUT, "pjejsxrycfgdwlqbhtwt", BUCKET);

const mime = (f) => {
  const e = f.toLowerCase();
  if (/\.png/.test(e)) return "image/png";
  if (/\.webp/.test(e)) return "image/webp";
  if (/\.gif/.test(e)) return "image/gif";
  if (/\.svg/.test(e)) return "image/svg+xml";
  if (/\.mp4/.test(e)) return "video/mp4";
  if (/\.jpe?g/.test(e)) return "image/jpeg";
  return "application/octet-stream";
};

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) =>
  x.isDirectory() ? walk(path.join(d, x.name)) : [path.join(d, x.name)]);

const sb = createClient(url, key);
const { error: be } = await sb.storage.createBucket(BUCKET, { public: true });
if (be && !/exist/i.test(be.message)) console.warn("Bucket:", be.message);

const files = walk(root);
let ok = 0, ko = 0;
for (const f of files) {
  const k = path.relative(root, f).split(path.sep).join("/");
  const { error } = await sb.storage.from(BUCKET).upload(k, fs.readFileSync(f), { contentType: mime(k), upsert: true });
  if (error) { ko++; console.error("ECHEC", k, error.message); } else ok++;
}
console.log(`Terminé : ${ok} envoyés, ${ko} échecs sur ${files.length} fichiers.`);
