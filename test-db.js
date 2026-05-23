import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

console.log("URL:", process.env.DIRECT_URL);
const sql = postgres(process.env.DIRECT_URL, { idle_timeout: 5 });

async function test() {
  try {
    const res = await sql`SELECT 1 as result`;
    console.log("Success:", res);
  } catch (err) {
    console.error("Connection Error:", err);
  } finally {
    await sql.end();
  }
}

test();
