import path from "node:path";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * Moteur d'import de produits multi-formats.
 * Formats acceptés : .xlsx, .csv, .tsv, .json, .md, .txt, .zip (avec images)
 */

export type ImportMode = "upsert" | "create" | "update";

export type ImportedProduct = {
  name: string;
  price: string;
  categoryName?: string;
  description?: string;
  unit?: string;
  badge?: string;
  inStock?: number;
  imageUrl?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
  image5Url?: string;
  videoUrl?: string;
  /** référence / SKU utilisée pour retrouver l'image correspondante dans un ZIP */
  reference?: string;
};

export type ImportSummary = {
  created: number;
  updated: number;
  skipped: number;
  categoriesCreated: number;
  errors: string[];
};

export const SUPPORTED_FORMATS = ".xlsx, .csv, .tsv, .json, .md, .txt, .zip";

const ALIASES: Record<string, string[]> = {
  name: ["name", "nom", "produit", "product", "productname", "titre", "title", "libelle", "designation", "titreduproduit", "article", "intitule"],
  price: ["price", "prix", "prixfcfa", "prixvente", "prixunitaire", "prixmin", "prixminfcfa", "prixmoyen", "prixmoyenfcfa", "cout", "cost", "tarif", "prixpublic"],
  categoryName: ["category", "categorie", "cat", "rayon", "famille", "groupe", "typedeproduit", "souscategorie"],
  description: ["description", "desc", "details", "detail", "caracteristiques", "caracteristiquesprincipales", "features", "information", "observations"],
  unit: ["unit", "unite", "unitemesure", "mesure", "conditionnement", "format"],
  badge: ["badge", "label", "tag", "etiquette", "promotion"],
  inStock: ["stock", "instock", "quantite", "quantiteenstock", "qty", "quantity", "enstock", "disponibilite"],
  imageUrl: ["image", "imageurl", "img", "photo", "lienimage", "urlimage", "imageprincipale", "image1", "img1", "photo1", "vignette"],
  image2Url: ["image2", "image2url", "img2", "photo2", "imagesecondaire"],
  image3Url: ["image3", "image3url", "img3", "photo3"],
  image4Url: ["image4", "image4url", "img4", "photo4"],
  image5Url: ["image5", "image5url", "img5", "photo5"],
  videoUrl: ["video", "videourl", "lienvideo"],
  reference: ["reference", "ref", "sku", "code", "codeproduit", "id", "idligne", "numero"],
};

const ALL_ALIASES = new Set(Object.values(ALIASES).flat());

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function slugify(value: string): string {
  return normalizeKey(value.replace(/&/g, " et "))
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "divers";
}

function pick(record: Record<string, unknown>, aliases: string[]): string {
  for (const [key, value] of Object.entries(record)) {
    if (aliases.includes(normalizeKey(key)) && value !== undefined && value !== null) {
      return String(value).trim();
    }
  }
  return "";
}

function normalizePrice(raw: string): string {
  let value = String(raw ?? "").replace(/[^\d.,]/g, "").trim();
  if (!value) return "";

  if (value.includes(",") && value.includes(".")) {
    value = value.lastIndexOf(",") > value.lastIndexOf(".")
      ? value.replace(/\./g, "").replace(",", ".")
      : value.replace(/,/g, "");
  } else if (value.includes(",")) {
    const parts = value.split(",");
    value = parts.length === 2 && parts[1].length === 2
      ? parts.join(".")
      : parts.join("");
  }

  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "";
}

function normalizeStock(raw: string, fallback = 10): number {
  if (!raw) return fallback;
  const match = String(raw).match(/-?\d+/);
  return match ? Number.parseInt(match[0], 10) : fallback;
}

function normalizeRow(record: Record<string, unknown>): ImportedProduct | null {
  const name = pick(record, ALIASES.name);
  if (!name) return null;

  const price = normalizePrice(pick(record, ALIASES.price));
  if (!price) return null;

  const product: ImportedProduct = {
    name: name.slice(0, 200),
    price,
    categoryName: pick(record, ALIASES.categoryName) || "Divers",
    description: pick(record, ALIASES.description) || undefined,
    unit: pick(record, ALIASES.unit) || undefined,
    badge: pick(record, ALIASES.badge) || undefined,
    inStock: normalizeStock(pick(record, ALIASES.inStock)),
    imageUrl: pick(record, ALIASES.imageUrl) || undefined,
    image2Url: pick(record, ALIASES.image2Url) || undefined,
    image3Url: pick(record, ALIASES.image3Url) || undefined,
    image4Url: pick(record, ALIASES.image4Url) || undefined,
    image5Url: pick(record, ALIASES.image5Url) || undefined,
    videoUrl: pick(record, ALIASES.videoUrl) || undefined,
    reference: pick(record, ALIASES.reference) || undefined,
  };
  return product;
}

/** Vrai si la cellule ressemble à un en-tête connu */
function looksLikeHeader(value: string): boolean {
  const key = normalizeKey(value);
  return ALL_ALIASES.has(key) || /prix|price|nom|name|image|photo|categor|stock|description|produit|product|reference/.test(key);
}

async function parseExcel(buffer: Buffer): Promise<ImportedProduct[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);

  const products: ImportedProduct[] = [];
  for (const sheet of workbook.worksheets) {
    let headerRowNumber = -1;
    const maxScan = Math.min(sheet.rowCount, 12);

    for (let rowNumber = 1; rowNumber <= maxScan; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      let matches = 0;
      for (let col = 1; col <= row.cellCount; col++) {
        if (looksLikeHeader(String(row.getCell(col).text ?? ""))) matches++;
      }
      if (matches >= 2) {
        headerRowNumber = rowNumber;
        break;
      }
    }
    if (headerRowNumber === -1) continue;

    const headerRow = sheet.getRow(headerRowNumber);
    const headers: string[] = [];
    for (let col = 1; col <= headerRow.cellCount; col++) {
      headers.push(String(headerRow.getCell(col).text ?? "").trim());
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= headerRowNumber) return;
      const record: Record<string, unknown> = {};
      let hasValue = false;
      headers.forEach((header, index) => {
        const value = row.getCell(index + 1).text;
        if (header && value !== undefined && value !== null && String(value).trim()) {
          record[header] = String(value).trim();
          hasValue = true;
        }
      });
      if (!hasValue) return;
      const product = normalizeRow(record);
      if (product) products.push(product);
    });
  }

  return products;
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseDelimited(text: string): ImportedProduct[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const first = lines[0];
  const delimiter = [";", "\t", ",", "|"].sort(
    (a, b) => first.split(b).length - first.split(a).length
  )[0];

  const headers = splitDelimitedLine(first, delimiter).map(h => h.replace(/^\uFEFF/, ""));
  const products: ImportedProduct[] = [];

  for (const line of lines.slice(1)) {
    const cells = splitDelimitedLine(line, delimiter);
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      if (header && cells[index] !== undefined) record[header] = cells[index];
    });
    const product = normalizeRow(record);
    if (product) products.push(product);
  }
  return products;
}

function parseJson(text: string): ImportedProduct[] {
  const parsed = JSON.parse(text.replace(/^\uFEFF/, ""));
  const array = Array.isArray(parsed)
    ? parsed
    : ["products", "produits", "items", "data", "list"].map(k => parsed?.[k]).find(Array.isArray) || [];

  return array
    .map((item: unknown) => normalizeRow(typeof item === "string" ? { name: item } : (item as Record<string, unknown>)))
    .filter((p: ImportedProduct | null): p is ImportedProduct => p !== null);
}

function parseMarkdown(text: string): ImportedProduct[] {
  const lines = text.split(/\r?\n/);
  const products: ImportedProduct[] = [];

  // 1) Tableaux Markdown : | Nom | Prix | Catégorie | ...
  let tableHeaders: string[] | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      tableHeaders = null;
      continue;
    }
    const cells = splitDelimitedLine(trimmed.slice(1).replace(/\|$/, ""), "|");
    if (cells.every(cell => /^:?-{2,}:?$/.test(cell.replace(/\s/g, "")))) continue;
    if (!tableHeaders) {
      tableHeaders = cells;
      continue;
    }
    const record: Record<string, unknown> = {};
    tableHeaders.forEach((header, index) => {
      if (header && cells[index] !== undefined) record[header] = cells[index];
    });
    const product = normalizeRow(record);
    if (product) products.push(product);
  }

  // 2) Sections : ## Nom du produit  +  - **Prix** : 1500 FCFA
  const sectionRegex = /^#{2,4}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  const sections: { title: string; body: string }[] = [];
  while ((match = sectionRegex.exec(text)) !== null) {
    const start = match.index + match[0].length;
    const next = text.slice(start).search(/^#{2,4}\s+/m);
    sections.push({
      title: match[1].trim(),
      body: next === -1 ? text.slice(start) : text.slice(start, start + next),
    });
  }

  for (const section of sections) {
    const record: Record<string, unknown> = { name: section.title };
    for (const line of section.body.split(/\r?\n/)) {
      const field = line.match(/^\s*(?:[-*+]\s*)?\*{0,2}([^*:\n]{2,40})\*{0,2}\s*:\s*(.+)$/);
      if (field) record[field[1].trim()] = field[2].trim();
    }
    const product = normalizeRow(record);
    if (product) products.push(product);
  }

  // 3) Liste simple "Nom | Prix | Catégorie" (sans pipe initial)
  if (products.length === 0) {
    for (const line of lines) {
      if (!line.includes("|") || line.trim().startsWith("|")) continue;
      const cells = line.split("|").map(c => c.trim());
      if (cells.length < 2) continue;
      const product = normalizeRow({ name: cells[0], price: cells[1], categoryName: cells[2] });
      if (product) products.push(product);
    }
  }

  return products;
}

type ParsedFile = { products: ImportedProduct[]; images: { name: string; data: Buffer }[] };

export async function parseFile(fileName: string, buffer: Buffer): Promise<ParsedFile> {
  const ext = path.extname(fileName).toLowerCase();
  const text = buffer.toString("utf8");

  switch (ext) {
    case ".xlsx":
    case ".xlsm":
      return { products: await parseExcel(buffer), images: [] };
    case ".csv":
    case ".tsv":
      return { products: parseDelimited(text), images: [] };
    case ".json":
      return { products: parseJson(text), images: [] };
    case ".md":
    case ".markdown":
    case ".txt":
      return { products: parseMarkdown(text), images: [] };
    case ".zip":
      return await parseZip(buffer);
    default:
      throw new Error(`Format "${ext || "inconnu"}" non pris en charge. Formats acceptés : ${SUPPORTED_FORMATS}`);
  }
}

async function parseZip(buffer: Buffer): Promise<ParsedFile> {
  const zip = await JSZip.loadAsync(buffer);
  const dataFiles: { name: string; data: Buffer }[] = [];
  const images: { name: string; data: Buffer }[] = [];
  const priority: Record<string, number> = { ".xlsx": 0, ".xlsm": 0, ".csv": 1, ".tsv": 1, ".json": 2, ".md": 3, ".markdown": 3, ".txt": 4 };

  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const ext = path.extname(name).toLowerCase();
    if (priority[ext] !== undefined) {
      dataFiles.push({ name, data: await entry.async("nodebuffer") });
    } else if (/\.(jpe?g|png|webp|gif|bmp)$/.test(ext)) {
      images.push({ name, data: await entry.async("nodebuffer") });
    }
  }

  dataFiles.sort((a, b) => (priority[path.extname(a.name).toLowerCase()] ?? 9) - (priority[path.extname(b.name).toLowerCase()] ?? 9));

  const products: ImportedProduct[] = [];
  const warnings: string[] = [];
  for (const file of dataFiles) {
    try {
      products.push(...(await parseFile(file.name, file.data)).products);
    } catch (error) {
      warnings.push(`${path.basename(file.name)} : ${error instanceof Error ? error.message : "erreur de lecture"}`);
    }
  }
  if (warnings.length) console.warn("[productImport] ZIP:", warnings.join(" | "));

  return { products, images };
}

function mimeFromName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".bmp") return "image/bmp";
  return "image/jpeg";
}

async function uploadImageBuffer(buffer: Buffer, hint: string, mime: string): Promise<string | undefined> {
  try {
    const extension = mime.split("/")[1].replace("jpeg", "jpg");
    const key = `products/import/${slugify(hint)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extension}`;
    const { url } = await storagePut(key, buffer, mime);
    return url;
  } catch (error) {
    console.error("[productImport] échec upload image:", error);
    return undefined;
  }
}

/** Upload une image encodée en data: URL et renvoie son URL publique */
async function resolveImageField(value: string | undefined, productName: string): Promise<string | undefined> {
  if (!value) return undefined;
  const dataUrl = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/i);
  if (!dataUrl) return value;
  return await uploadImageBuffer(Buffer.from(dataUrl[2], "base64"), productName, dataUrl[1]);
}

/** Associe les images d'un ZIP aux produits (référence, nom de fichier, puis ordre numérique) */
function attachZipImages(products: ImportedProduct[], images: { name: string; data: Buffer }[]): void {
  if (!images.length) return;
  const used = new Set<number>();

  const findImage = (candidate: string): number => {
    const key = normalizeKey(candidate);
    if (!key) return -1;
    return images.findIndex((image, index) => !used.has(index) && normalizeKey(image.name).includes(key));
  };

  for (const product of products) {
    for (const candidate of [product.reference, product.imageUrl, product.name]) {
      const index = findImage(candidate || "");
      if (index === -1) continue;
      used.add(index);
      product.imageUrl = images[index].name;
      break;
    }
  }

  // Les images nommées 1.jpg, 2.png... sont assignées dans l'ordre aux produits sans image
  const numeric = images
    .map((image, index) => ({ image, index, number: Number.parseInt(path.basename(image.name, path.extname(image.name)), 10) }))
    .filter(item => Number.isFinite(item.number) && !used.has(item.index))
    .sort((a, b) => a.number - b.number);

  if (numeric.length) {
    for (const product of products) {
      if (product.imageUrl) continue;
      const next = numeric.find(item => !used.has(item.index));
      if (!next) break;
      used.add(next.index);
      product.imageUrl = next.image.name;
    }
  }
}

export async function importProductsFromFile(input: {
  fileName: string;
  fileData: string; // base64
  mode: ImportMode;
}): Promise<ImportSummary> {
  const buffer = Buffer.from(input.fileData, "base64");
  const { products, images } = await parseFile(input.fileName, buffer);
  attachZipImages(products, images);

  const summary: ImportSummary = {
    created: 0,
    updated: 0,
    skipped: 0,
    categoriesCreated: 0,
    errors: [],
  };

  if (!products.length) {
    summary.errors.push("Aucun produit lisible trouvé dans le fichier. Vérifiez les colonnes Nom et Prix.");
    return summary;
  }

  let categories = await db.getAllCategories();
  const existingProducts = await db.getAllProductsAdmin();
  const categoryNameById = new Map(categories.map(category => [category.id, normalizeKey(category.name)]));
  const existingByKey = new Map(
    existingProducts.map(product => [
      `${normalizeKey(product.name)}|${categoryNameById.get(product.categoryId) ?? ""}`,
      product,
    ])
  );
  const importedKeys = new Set<string>();

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    try {
      const categoryName = (product.categoryName || "Divers").slice(0, 100);
      const categoryKey = normalizeKey(categoryName) || "divers";
      let category = categories.find(item => normalizeKey(item.name) === categoryKey);

      if (!category) {
        if (input.mode === "update") {
          summary.skipped++;
          continue;
        }
        let slug = slugify(categoryName);
        let suffix = 2;
        while (categories.some(item => item.slug === slug)) slug = `${slugify(categoryName)}-${suffix++}`;
        await db.createCategory({ name: categoryName, slug, emoji: "📦", description: null });
        category = (await db.getAllCategories()).find(item => item.slug === slug);
        if (!category) throw new Error("catégorie créée mais introuvable");
        categories = await db.getAllCategories();
        categoryNameById.set(category.id, normalizeKey(category.name));
        summary.categoriesCreated++;
      }

      const key = `${normalizeKey(product.name)}|${normalizeKey(category.name)}`;
      if (importedKeys.has(key)) {
        summary.skipped++;
        continue;
      }
      const existing = existingByKey.get(key);
      if (existing && input.mode === "create") {
        summary.skipped++;
        continue;
      }
      if (!existing && input.mode === "update") {
        summary.skipped++;
        continue;
      }

      let imageUrl = product.imageUrl;
      if (imageUrl) {
        const zipImage = images.find(image => image.name === imageUrl || path.basename(image.name) === imageUrl);
        if (zipImage) {
          imageUrl = await uploadImageBuffer(zipImage.data, product.name, mimeFromName(zipImage.name));
        } else {
          imageUrl = await resolveImageField(imageUrl, product.name);
        }
      }

      const data: Record<string, unknown> = {
        name: product.name.slice(0, 200),
        price: product.price,
        categoryId: category.id,
      };
      if (product.description) data.description = product.description;
      if (product.unit) data.unit = product.unit.slice(0, 50);
      if (product.badge) data.badge = product.badge.slice(0, 50);
      if (product.inStock !== undefined) data.inStock = product.inStock;
      if (imageUrl) data.imageUrl = imageUrl;
      for (const field of ["image2Url", "image3Url", "image4Url", "image5Url"] as const) {
        const value = await resolveImageField(product[field], product.name);
        if (value) data[field] = value;
      }
      if (product.videoUrl) data.videoUrl = product.videoUrl;

      if (existing) {
        await db.updateProduct(existing.id, data);
        summary.updated++;
      } else {
        await db.createProduct({
          ...data,
          name: data.name as string,
          price: data.price as string,
          categoryId: data.categoryId as number,
          inStock: (data.inStock as number | undefined) ?? 10,
        } as any);
        summary.created++;
      }
      importedKeys.add(key);
    } catch (error) {
      summary.errors.push(`Ligne ${index + 1} (${product.name}) : ${error instanceof Error ? error.message : "erreur inconnue"}`);
      summary.skipped++;
    }
  }

  return summary;
}
