import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function listProducts() {
  try {
    const res = await sql`SELECT name FROM products ORDER BY name ASC`;
    console.log("--- START OF PRODUCTS ---");
    res.forEach(p => console.log(p.name));
    console.log("--- END OF PRODUCTS ---");
  } catch (err) {
    console.error("Query Error:", err);
  } finally {
    await sql.end();
  }
}

listProducts();
