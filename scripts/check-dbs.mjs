import "dotenv/config";
import postgres from "postgres";
const targets = { ancienne: process.env.DATABASE_URL, nouvelle: process.env.motdepasse };
for (const [name, u] of Object.entries(targets)) {
  const sql = postgres(u, { ssl: "require", connect_timeout: 10, prepare: false, max: 1 });
  try {
    const t = await sql`select table_name from information_schema.tables where table_schema='public' order by 1`;
    const counts = [];
    for (const { table_name } of t) {
      const [{ n }] = await sql.unsafe(`select count(*)::int n from "${table_name}"`);
      counts.push(`${table_name}=${n}`);
    }
    console.log(name, "OK :", counts.join(", ") || "(aucune table)");
  } catch (e) { console.log(name, "ERREUR :", e.message); }
  await sql.end();
}
