import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();
const require = createRequire(import.meta.url);
const base = "../.vercel/output/services/jappandal/functions/api";

for (const name of ["trpc/[trpc].func/index.js", "cron/social.func/index.js"]) {
  try {
    const mod = require(fileURLToPath(new URL(`${base}/${name}`, import.meta.url)));
    console.log(name, "→", typeof mod, typeof mod.default);
  } catch (error) {
    console.log(name, "ERREUR:", error.message);
  }
}
