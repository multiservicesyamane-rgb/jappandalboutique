import "dotenv/config";
import postgres from "postgres";
const u = process.env.DATABASE_URL;
console.log("format:", u.replace(/:[^:@/]+@/, ":***@"));
const sql = postgres(u, { ssl: "require", connect_timeout: 10, max: 1, prepare: false, onnotice: () => {} });
try {
  const t = await sql`select table_name from information_schema.tables where table_schema='public' order by 1`;
  const out = [];
  for (const { table_name } of t) { const [{ n }] = await sql.unsafe(`select count(*)::int n from "${table_name}"`); out.push(`${table_name}=${n}`); }
  console.log("CONNEXION OK. Tables:", out.join(", ") || "(aucune)");
} catch (e) { console.log("ERREUR:", e.message); }
await sql.end();
