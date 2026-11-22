import "dotenv/config";
import fs from "node:fs";
import postgres from "postgres";
import JSZip from "jszip";
import { storagePut } from "../server/storage.ts";

/**
 * Associe les images du ZIP jappandal_photos_produits.zip aux produits.
 * Correspondance établie par identification visuelle des emballages.
 * Clé : numéro de l'image dans le ZIP → ID du produit en base.
 */
const MAPPING = {
  1: 29, 2: 9, 3: 12, 4: 8, 5: 172, 8: 38, 9: 1, 11: 86, 12: 32,
  14: 34, 15: 44, 16: 227, 17: 94, 18: 7, 20: 27, 21: 51, 22: 46,
  23: 13, 24: 33, 25: 19, 26: 62, 27: 30, 28: 38, 29: 12, 32: 35,
  33: 22, 34: 59, 37: 26, 38: 60, 39: 128, 41: 167, 42: 139, 43: 108,
  45: 128, 46: 23, 47: 78, 48: 47, 50: 132, 51: 168, 52: 21, 53: 131,
  54: 166, 55: 76, 56: 82, 57: 169, 58: 92, 59: 81, 60: 14, 61: 170,
  62: 111, 63: 63, 64: 64, 65: 151, 66: 66, 67: 71, 68: 15, 69: 31,
  70: 110, 71: 20, 72: 124, 73: 16, 74: 77, 75: 17, 77: 88, 78: 113,
  79: 61, 81: 13, 82: 37, 83: 52, 84: 4, 85: 2, 86: 171,
  89: 133, 90: 225, 91: 6, 92: 48, 93: 3, 95: 18, 96: 16, 97: 39,
  99: 1, 101: 46, 103: 107, 104: 140, 106: 47, 107: 5, 108: 24,
  109: 25, 110: 229, 111: 48, 112: 93, 113: 42, 114: 12, 116: 45,
  117: 117, 118: 65, 119: 36, 120: 162, 123: 174, 124: 165, 125: 56,
  126: 28, 127: 4, 128: 54, 129: 43, 130: 43, 131: 62, 132: 71,
};

const ZIP_PATH = "C:/Users/lenovo/Downloads/jappandal_photos_produits.zip";
const zip = await JSZip.loadAsync(fs.readFileSync(ZIP_PATH));
const sql = postgres(process.env.DATABASE_URL || process.env.DIRECT_URL, {
  ssl: "require", max: 2, prepare: false, connect_timeout: 20,
});

let ok = 0;
let fail = 0;
try {
  for (const [num, productId] of Object.entries(MAPPING)) {
    const entry = zip.file(`images/${num.padStart(3, "0")}.jpeg`);
    if (!entry) {
      console.log(`⚠️  ${num} : fichier introuvable dans le ZIP`);
      fail++;
      continue;
    }

    const [product] = await sql`SELECT id, name FROM products WHERE id = ${productId} LIMIT 1`;
    if (!product) {
      console.log(`⚠️  ${num} : produit ${productId} introuvable`);
      fail++;
      continue;
    }

    try {
      const data = await entry.async("nodebuffer");
      const key = `products/image-${num.padStart(3, "0")}-${Date.now().toString(36)}.jpg`;
      const { url } = await storagePut(key, data, "image/jpeg");
      await sql`UPDATE products SET "imageUrl" = ${url}, "updatedAt" = NOW() WHERE id = ${productId}`;
      console.log(`✓ ${num.padStart(3, "0")} → ${productId} ${product.name}`);
      ok++;
    } catch (error) {
      console.log(`✗ ${num.padStart(3, "0")} → ${productId} : ${error.message}`);
      fail++;
    }
  }
  console.log(`\n✅ ${ok} image(s) associée(s), ${fail} échec(s)`);
} finally {
  await sql.end();
}
