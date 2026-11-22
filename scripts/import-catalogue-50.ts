import "dotenv/config";
import path from "node:path";
import ExcelJS from "exceljs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq } from "drizzle-orm";
import { categories, products } from "../drizzle/schema";

/**
 * Import du catalogue "50 produits les plus vendus au Sénégal".
 *
 * Usage :
 *   npx tsx scripts/import-catalogue-50.ts --dry-run
 *   npx tsx scripts/import-catalogue-50.ts
 *
 * Le script est idempotent : il met à jour un produit existant
 * (même nom + même catégorie) au lieu de créer un doublon.
 */

const CATALOG_PATH =
  process.argv.find(arg => arg.endsWith(".xlsx")) ??
  path.resolve(process.cwd(), "scripts/data/Catalogue_50_produits_Senegal.xlsx");

const DRY_RUN = process.argv.includes("--dry-run");

const CATEGORY_META: Record<string, { slug: string; emoji: string; description: string }> = {
  "Mode & Habillement": {
    slug: "mode-habillement",
    emoji: "👗",
    description: "Vêtements, chaussures, maroquinerie et accessoires",
  },
  "Parfums & Cosmétiques": {
    slug: "parfums-cosmetiques",
    emoji: "💄",
    description: "Parfums, soins visage, maquillage et soins cheveux",
  },
  "Téléphones & Accessoires": {
    slug: "telephones-accessoires",
    emoji: "📱",
    description: "Smartphones, audio et accessoires téléphonie",
  },
  "Informatique & Gaming": {
    slug: "informatique-gaming",
    emoji: "💻",
    description: "Ordinateurs, gaming, stockage et périphériques",
  },
  "Électroménager": {
    slug: "electromenager",
    emoji: "🔌",
    description: "Froid, TV, ventilation, climatisation et cuisine",
  },
  "Produits Bébés & Enfants": {
    slug: "produits-bebes-enfants",
    emoji: "🧸",
    description: "Hygiène, alimentation, mobilité, jouets et vêtements bébé",
  },
  "Fitness & Sport": {
    slug: "fitness-sport",
    emoji: "🏋️",
    description: "Musculation, yoga, cardio et accessoires sport",
  },
  "Maison & Cuisine": {
    slug: "maison-cuisine",
    emoji: "🍳",
    description: "Cuisson, literie, art de la table et petit électroménager",
  },
  "Alimentation & Épicerie": {
    slug: "alimentation-epicerie",
    emoji: "🛒",
    description: "Céréales, huiles, boissons, lait et épices",
  },
  "Santé & Bien-être": {
    slug: "sante-bien-etre",
    emoji: "💊",
    description: "Mesure, compléments et bien-être",
  },
};

type CatalogRow = {
  id: number;
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  variants: string;
  description: string;
  features: string;
  rating: string;
  warranty: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function toNumber(value: string): number {
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function readCatalog(): Promise<CatalogRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(CATALOG_PATH);

  const sheet =
    workbook.getWorksheet("Catalogue 50 produits") ?? workbook.worksheets[0];
  if (!sheet) throw new Error("Aucune feuille trouvée dans le catalogue");

  // Les en-têtes sont en ligne 3
  const headerRow = sheet.getRow(3);
  const headerIndex = new Map<string, number>();
  headerRow.eachCell((cell, col) => {
    headerIndex.set(String(cell.text ?? "").trim(), col);
  });

  const required = [
    "Catégorie",
    "Sous-catégorie",
    "Titre du produit",
    "Marque",
    "Prix min (FCFA)",
    "Prix max (FCFA)",
    "Prix moyen (FCFA)",
    "Variantes / options",
    "Description",
    "Caractéristiques principales",
    "Note /5",
    "Garantie",
  ];
  const missing = required.filter(h => !headerIndex.has(h));
  if (missing.length) {
    throw new Error(`Colonnes manquantes dans le catalogue : ${missing.join(", ")}`);
  }

  const get = (row: ExcelJS.Row, header: string): string => {
    const col = headerIndex.get(header);
    return col ? String(row.getCell(col).text ?? "").trim() : "";
  };

  const rows: CatalogRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return;

    const name = get(row, "Titre du produit");
    const category = get(row, "Catégorie");
    if (!name || !category) return;

    rows.push({
      id: toNumber(get(row, "ID")),
      category,
      subcategory: get(row, "Sous-catégorie"),
      name,
      brand: get(row, "Marque"),
      priceMin: toNumber(get(row, "Prix min (FCFA)")),
      priceMax: toNumber(get(row, "Prix max (FCFA)")),
      priceAvg: toNumber(get(row, "Prix moyen (FCFA)")),
      variants: get(row, "Variantes / options"),
      description: get(row, "Description"),
      features: get(row, "Caractéristiques principales"),
      rating: get(row, "Note /5"),
      warranty: get(row, "Garantie"),
    });
  });

  return rows;
}

function buildDescription(row: CatalogRow): string {
  const parts: string[] = [];

  if (row.description) parts.push(row.description);

  const features = row.features
    .split("·")
    .map(f => f.trim())
    .filter(Boolean);
  if (features.length) {
    parts.push(`Caractéristiques :\n${features.map(f => `• ${f}`).join("\n")}`);
  }

  if (row.variants) parts.push(`Variantes : ${row.variants}`);
  if (row.brand) parts.push(`Marque : ${row.brand}`);
  if (row.rating) parts.push(`Note : ${row.rating}/5`);
  if (row.warranty) parts.push(`Garantie : ${row.warranty}`);

  return parts.join("\n\n");
}

function buildBadge(row: CatalogRow): string | null {
  const rating = toNumber(row.rating);
  if (rating >= 4.6) return "Populaire";
  if (rating >= 4.4) return "Recommandé";
  return null;
}

async function main() {
  console.log(`📖 Lecture du catalogue : ${CATALOG_PATH}`);
  const rows = await readCatalog();
  console.log(`   ${rows.length} produits trouvés`);

  if (rows.length !== 50) {
    console.warn(`⚠️  Attendu : 50 produits — trouvés : ${rows.length}`);
  }

  const unknownCategories = [...new Set(rows.map(r => r.category))].filter(
    c => !CATEGORY_META[c]
  );
  if (unknownCategories.length) {
    throw new Error(
      `Catégories non reconnues : ${unknownCategories.join(", ")}. ` +
        `Ajoutez-les dans CATEGORY_META.`
    );
  }

  const summary = new Map<string, number>();
  for (const row of rows) {
    summary.set(row.category, (summary.get(row.category) ?? 0) + 1);
  }

  console.log("\n📊 Répartition :");
  for (const [category, count] of summary) {
    console.log(`   ${CATEGORY_META[category].emoji} ${category} : ${count}`);
  }

  if (DRY_RUN) {
    console.log("\n🔎 Mode --dry-run : aucune écriture en base.");
    console.log("\nAperçu des 3 premiers produits :");
    for (const row of rows.slice(0, 3)) {
      console.log(`\n   • ${row.name} (${row.category})`);
      console.log(`     Prix : ${row.priceMin.toLocaleString("fr-FR")} FCFA`);
      console.log(`     ${buildDescription(row).replace(/\n/g, "\n     ")}`);
    }
    return;
  }

  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL (ou DIRECT_URL) est manquant. Ajoutez la nouvelle URL Supabase dans .env."
    );
  }

  const isSupabase = url.includes("supabase.co") || url.includes("supabase.com");
  const client = postgres(url, {
    ssl: isSupabase ? "require" : false,
    max: 1,
    prepare: false,
    connect_timeout: 15,
  });
  const db = drizzle(client);

  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let productsCreated = 0;
  let productsUpdated = 0;

  try {
    console.log("\n🏷️  Import des catégories…");
    const categoryIds = new Map<string, number>();

    for (const [name, meta] of Object.entries(CATEGORY_META)) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, meta.slug))
        .limit(1);

      if (existing.length) {
        await db
          .update(categories)
          .set({ name, emoji: meta.emoji, description: meta.description })
          .where(eq(categories.id, existing[0].id));
        categoryIds.set(name, existing[0].id);
        categoriesUpdated++;
      } else {
        const inserted = await db
          .insert(categories)
          .values({
            name,
            slug: meta.slug,
            emoji: meta.emoji,
            description: meta.description,
          })
          .returning({ id: categories.id });
        categoryIds.set(name, inserted[0].id);
        categoriesCreated++;
      }
    }

    console.log(`   ${categoriesCreated} créée(s), ${categoriesUpdated} mise(s) à jour`);

    console.log("\n📦 Import des produits…");
    for (const row of rows) {
      const categoryId = categoryIds.get(row.category);
      if (!categoryId) throw new Error(`Catégorie introuvable : ${row.category}`);

      const values = {
        name: row.name.slice(0, 200),
        description: buildDescription(row),
        price: row.priceMin.toFixed(2),
        unit: null,
        categoryId,
        badge: buildBadge(row),
        inStock: 10,
      };

      const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.name, values.name), eq(products.categoryId, categoryId)))
        .limit(1);

      if (existing.length) {
        await db
          .update(products)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(products.id, existing[0].id));
        productsUpdated++;
      } else {
        await db.insert(products).values(values);
        productsCreated++;
      }
    }

    console.log(`   ${productsCreated} créé(s), ${productsUpdated} mis à jour`);

    const [countRow] = await client<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM products
    `;
    console.log(`\n✅ Import terminé — ${countRow.count} produits au total en base.`);
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error("\n❌ Erreur :", error instanceof Error ? error.message : error);
  process.exit(1);
});
