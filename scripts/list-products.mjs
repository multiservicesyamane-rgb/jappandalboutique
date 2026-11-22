import "dotenv/config";
import postgres from "postgres";
import fs from "node:fs";
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });
const rows = await sql`select p.id, p.name, p."imageUrl" as img, c.name as cat from products p left join categories c on c.id = p."categoryId" order by c.name, p.name`;
fs.writeFileSync("scripts/data/products-list.json", JSON.stringify(rows, null, 1));
console.log("total", rows.length, "sans image", rows.filter((r) => !r.img).length);
console.log(rows.slice(0, 300).map((r) => `${r.id}|${r.cat}|${r.name}|${r.img ? "IMG" : "-"}`).join("\n"));
await sql.end();
