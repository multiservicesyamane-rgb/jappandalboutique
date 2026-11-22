// Met DATABASE_URL / DIRECT_URL sur le nouveau projet (via le pooler) à partir de "motdepasse"
import fs from "node:fs";
import "dotenv/config";
const [, pass, ref] = process.env.motdepasse.match(/postgres(?:\.[a-z0-9]+)?:(.+)@(?:db\.)?([a-z0-9]{20})?/) || [];
const m = process.env.motdepasse.match(/postgres(?:\.([a-z0-9]{20}))?:(.+)@(?:db\.([a-z0-9]{20})\.supabase\.co|[^/]+)/);
const projectRef = m[1] || m[3];
const pw = encodeURIComponent(decodeURIComponent(m[2]));
const host = "aws-0-eu-west-1.pooler.supabase.com";
const db = `postgresql://postgres.${projectRef}:${pw}@${host}:6543/postgres`;
const direct = `postgresql://postgres.${projectRef}:${pw}@${host}:5432/postgres`;
let env = fs.readFileSync(".env", "utf8");
env = env.replace(/^DATABASE_URL=(.*)$/m, (_, old) => `# ANCIEN: DATABASE_URL=${old}\nDATABASE_URL=${db}`);
env = env.replace(/^DIRECT_URL=(.*)$/m, (_, old) => `# ANCIEN: DIRECT_URL=${old}\nDIRECT_URL=${direct}`);
fs.copyFileSync(".env", ".env.backup-avant-migration");
fs.writeFileSync(".env", env);
console.log("OK, projet:", projectRef);
