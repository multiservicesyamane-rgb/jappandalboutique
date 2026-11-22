import "dotenv/config";
import postgres from "postgres";
const [, pass, ref] = process.env.motdepasse.match(/postgres:(.+)@db\.([a-z0-9]+)\.supabase\.co/);
const raw = decodeURIComponent(pass);
const variants = [...new Set([raw, raw.replace(/^\[|\]$/g, "")])];
const regions = ["eu-west-1","eu-west-2","eu-west-3","eu-central-1","eu-central-2","eu-north-1","us-east-1","us-east-2","us-west-1","us-west-2","ca-central-1","sa-east-1","ap-south-1","ap-southeast-1","ap-southeast-2","ap-northeast-1","ap-northeast-2"];
const hosts = regions.flatMap((r) => [`aws-0-${r}.pooler.supabase.com`, `aws-1-${r}.pooler.supabase.com`]);
const tries = hosts.flatMap((host) => variants.map((password, i) => ({ host, password, i })));
await Promise.all(tries.map(async ({ host, password, i }) => {
  const sql = postgres({ host, port: 5432, user: `postgres.${ref}`, password, database: "postgres", ssl: "require", connect_timeout: 10, max: 1, prepare: false, onnotice: () => {} });
  try { await sql`select 1`; console.log("OK", host, i === 0 ? "avec crochets" : "sans crochets"); }
  catch (e) { if (!/not found|ENOTFOUND/i.test(e.message)) console.log(host, i === 0 ? "avec" : "sans", "->", e.message); }
  await sql.end({ timeout: 1 });
}));
console.log("fin");
