import { eq, desc, and, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, categories, products, orders, customers, settings, banners, affiliateLinks, adBanners, productDrafts, productMedia, productSpecs, InsertCategory, InsertProduct, InsertOrder, InsertCustomer, InsertSetting, InsertBanner, InsertAffiliateLink, InsertAdBanner, InsertProductDraft, InsertProductMedia, InsertProductSpec } from "../drizzle/schema";
import { resolveImageUrl } from "./storage";

let _db: ReturnType<typeof drizzle> | null = null;
let queryClient: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL est manquant dans les variables d'environnement Vercel !");
    }
    try {
      const url = process.env.DATABASE_URL;
      const isSupabase = url.includes("supabase.co") || url.includes("supabase.com");
      
      queryClient = postgres(url, {
        ssl: isSupabase ? "require" : false,
        connect_timeout: 10, // Fail after 10 seconds instead of hanging
        idle_timeout: 10,
        max: 5,
        prepare: false, // REQUIRED for Supabase pooler (port 6543)
      });
      _db = drizzle(queryClient);
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      throw error;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Categories helpers
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

export async function updateCategory(id: number, category: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(category).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// Resolve legacy /uploads/ image paths to full Supabase Storage URLs
function fixProductImages<T extends { imageUrl?: string | null; image2Url?: string | null; image3Url?: string | null; image4Url?: string | null; image5Url?: string | null }>(p: T): T {
  return {
    ...p,
    imageUrl: resolveImageUrl(p.imageUrl),
    image2Url: resolveImageUrl(p.image2Url),
    image3Url: resolveImageUrl(p.image3Url),
    image4Url: resolveImageUrl(p.image4Url),
    image5Url: resolveImageUrl(p.image5Url),
  };
}

// Products helpers
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return rows.map(fixProductImages);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? fixProductImages(result[0]) : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).where(eq(products.categoryId, categoryId)).orderBy(desc(products.createdAt));
  return rows.map(fixProductImages);
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(products).where(like(products.name, `%${query}%`)).orderBy(desc(products.createdAt));
  return rows.map(fixProductImages);
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// Orders helpers
export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result;
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(order).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orders).where(eq(orders.id, id));
}

export async function getOrderStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, contacted: 0, confirmed: 0, delivered: 0, cancelled: 0 };
  
  const result = await db.select({
    total: sql<number>`cast(count(*) as int)`,
    pending: sql<number>`cast(sum(case when status = 'pending' then 1 else 0 end) as int)`,
    contacted: sql<number>`cast(sum(case when status = 'contacted' then 1 else 0 end) as int)`,
    confirmed: sql<number>`cast(sum(case when status = 'confirmed' then 1 else 0 end) as int)`,
    delivered: sql<number>`cast(sum(case when status = 'delivered' then 1 else 0 end) as int)`,
    cancelled: sql<number>`cast(sum(case when status = 'cancelled' then 1 else 0 end) as int)`,
  }).from(orders);
  
  return result[0] || { total: 0, pending: 0, contacted: 0, confirmed: 0, delivered: 0, cancelled: 0 };
}

// ==================== Customers ====================

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return result;
}

export async function updateCustomer(id: number, customer: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(customer).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customers).where(eq(customers.id, id));
}

export async function getCustomerOrders(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
}

// ==================== Settings ====================

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(settings);
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettingByKey(key);
  if (existing) {
    await db.update(settings).set({ value, description }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value, description });
  }
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(settings).where(eq(settings.key, key));
}

// ==================== Banners ====================

export async function getAllBanners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(banners).orderBy(banners.displayOrder);
}

export async function getActiveBanners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(banners).where(eq(banners.isActive, 1)).orderBy(banners.displayOrder);
}

export async function getBannerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBanner(banner: InsertBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(banners).values(banner);
  return result;
}

export async function updateBanner(id: number, banner: Partial<InsertBanner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(banners).set(banner).where(eq(banners.id, id));
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(banners).where(eq(banners.id, id));
}

// ==================== Statistics ====================

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: "0",
    todayOrders: 0,
    pendingOrders: 0,
  };

  const [productsCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(products);
  const [categoriesCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(categories);
  const [customersCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(customers);
  const [ordersCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(orders);
  const [revenueSum] = await db.select({ total: sql<string>`COALESCE(SUM("totalAmount"), 0)` }).from(orders).where(eq(orders.status, 'delivered'));
  const [todayCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(orders).where(sql`DATE("createdAt") = CURRENT_DATE`);
  const [pendingCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(orders).where(eq(orders.status, 'pending'));

  return {
    totalProducts: Number(productsCount?.count || 0),
    totalCategories: Number(categoriesCount?.count || 0),
    totalCustomers: Number(customersCount?.count || 0),
    totalOrders: Number(ordersCount?.count || 0),
    totalRevenue: revenueSum?.total || "0",
    todayOrders: Number(todayCount?.count || 0),
    pendingOrders: Number(pendingCount?.count || 0),
  };
}

export async function getPopularProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      productId: orders.productId,
      productName: orders.productName,
      totalOrders: sql<number>`count(*)`,
      totalQuantity: sql<number>`sum(${orders.quantity})`,
      totalRevenue: sql<string>`sum(${orders.totalAmount})`,
    })
    .from(orders)
    .groupBy(orders.productId, orders.productName)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return result;
}

export async function getRecentOrders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

// ==================== Affiliate Links ====================

export async function getAllAffiliateLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(affiliateLinks).orderBy(desc(affiliateLinks.createdAt));
}

export async function getActiveAffiliateLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(affiliateLinks).where(eq(affiliateLinks.isActive, 1)).orderBy(desc(affiliateLinks.createdAt));
}

export async function getAffiliateLinkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliateLinks).where(eq(affiliateLinks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateLinksByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(affiliateLinks).where(and(eq(affiliateLinks.categoryId, categoryId), eq(affiliateLinks.isActive, 1)));
}

export async function getAffiliateLinksByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(affiliateLinks).where(and(eq(affiliateLinks.productId, productId), eq(affiliateLinks.isActive, 1)));
}

export async function createAffiliateLink(link: InsertAffiliateLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliateLinks).values(link);
  return result;
}

export async function updateAffiliateLink(id: number, link: Partial<InsertAffiliateLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliateLinks).set(link).where(eq(affiliateLinks.id, id));
}

export async function deleteAffiliateLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(affiliateLinks).where(eq(affiliateLinks.id, id));
}

export async function incrementAffiliateLinkClick(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliateLinks).set({ clicks: sql`clicks + 1` }).where(eq(affiliateLinks.id, id));
}

// ==================== Ad Banners ====================

export async function getAllAdBanners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adBanners).orderBy(adBanners.displayOrder);
}

export async function getActiveAdBanners() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adBanners).where(eq(adBanners.isActive, 1)).orderBy(adBanners.displayOrder);
}

export async function getAdBannersByPosition(position: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adBanners).where(and(eq(adBanners.position, position), eq(adBanners.isActive, 1))).orderBy(adBanners.displayOrder);
}

export async function getAdBannerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adBanners).where(eq(adBanners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdBanner(banner: InsertAdBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adBanners).values(banner);
  return result;
}

export async function updateAdBanner(id: number, banner: Partial<InsertAdBanner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adBanners).set(banner).where(eq(adBanners.id, id));
}

export async function deleteAdBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adBanners).where(eq(adBanners.id, id));
}

export async function incrementAdBannerImpression(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adBanners).set({ impressions: sql`impressions + 1` }).where(eq(adBanners.id, id));
}

export async function incrementAdBannerClick(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adBanners).set({ clicks: sql`clicks + 1` }).where(eq(adBanners.id, id));
}


// ===== Product Drafts Management =====

export async function createProductDraft(data: Partial<InsertProductDraft>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productDrafts).values({
    name: data.name || 'New Product',
    slug: data.slug,
    categoryId: data.categoryId,
    currentStep: data.currentStep || 1,
    completionPercentage: data.completionPercentage || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as InsertProductDraft);
  return result;
}

export async function getProductDraftById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const draft = await db.select().from(productDrafts).where(eq(productDrafts.id, id)).limit(1);
  return draft[0] || null;
}

export async function updateProductDraft(id: number, data: Partial<InsertProductDraft>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productDrafts).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(productDrafts.id, id));
}

export async function deleteProductDraft(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated media and specs first
  await db.delete(productMedia).where(eq(productMedia.productId, id));
  await db.delete(productSpecs).where(eq(productSpecs.productId, id));
  await db.delete(productDrafts).where(eq(productDrafts.id, id));
}

// ===== Product Media Management =====

export async function createProductMedia(data: InsertProductMedia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productMedia).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function deleteProductMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productMedia).where(eq(productMedia.id, id));
}

export async function updateProductMediaOrder(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(productMedia).set({ sortOrder }).where(eq(productMedia.id, id));
}

export async function getProductMediaByProductId(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(productMedia).where(eq(productMedia.productId, productId));
}

// ===== Product Specs Management =====

export async function createProductSpec(data: InsertProductSpec) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(productSpecs).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function deleteProductSpec(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productSpecs).where(eq(productSpecs.id, id));
}

export async function getProductSpecsByProductId(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(productSpecs).where(eq(productSpecs.productId, productId));
}
