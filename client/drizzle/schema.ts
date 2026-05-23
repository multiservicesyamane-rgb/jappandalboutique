import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing products
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table for the e-commerce catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }), // kg, litre, pièce, etc.
  imageUrl: text("imageUrl"), // Image principale (backward compatibility)
  image2Url: text("image2Url"),
  image3Url: text("image3Url"),
  image4Url: text("image4Url"),
  image5Url: text("image5Url"),
  categoryId: int("categoryId").notNull(),
  badge: varchar("badge", { length: 50 }), // Populaire, Frais, Premium, etc.
  inStock: int("inStock").default(1).notNull(), // 1 = en stock, 0 = rupture
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders tracking table for WhatsApp orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  productPrice: decimal("productPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  deliveryLocation: text("deliveryLocation"),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerName: varchar("customerName", { length: 200 }),
  customerId: int("customerId"),
  status: mysqlEnum("status", ["pending", "contacted", "confirmed", "delivered", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Customers table for tracking customer information
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Settings table for site configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Banners table for homepage content management
 */
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  linkUrl: text("linkUrl"),
  isActive: int("isActive").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Site content table for CMS - allows dynamic modification of all site elements
 */
export const siteContent = mysqlTable("site_content", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 100 }).notNull(), // header, footer, home, menu, etc.
  key: varchar("key", { length: 100 }).notNull(), // logo_url, menu_item_1, hero_title, etc.
  value: text("value"),
  type: varchar("type", { length: 50 }).notNull(), // text, image, color, json, etc.
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

/**
 * Menu items table for dynamic menu management
 */
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  displayOrder: int("displayOrder").default(0).notNull(),
  isVisible: int("isVisible").default(1).notNull(),
  target: varchar("target", { length: 20 }).default("_self"), // _self, _blank
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Affiliate links table for monetization
 */
export const affiliateLinks = mysqlTable("affiliate_links", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // Nom du lien (ex: "Amazon - Électronique")
  url: text("url").notNull(), // URL d'affiliation complète
  description: text("description"),
  platform: varchar("platform", { length: 100 }), // Amazon, Jumia, AliExpress, etc.
  categoryId: int("categoryId"), // Catégorie associée (optionnel)
  productId: int("productId"), // Produit associé (optionnel)
  clicks: int("clicks").default(0).notNull(), // Nombre de clics
  conversions: int("conversions").default(0).notNull(), // Nombre de conversions
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(), // Revenus générés
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Ad banners table for advertising monetization
 */
export const adBanners = mysqlTable("ad_banners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // Nom de la bannière
  position: varchar("position", { length: 50 }).notNull(), // homepage_top, homepage_sidebar, product_bottom, etc.
  type: mysqlEnum("type", ["image", "html", "adsense"]).default("image").notNull(),
  content: text("content").notNull(), // URL image, code HTML, ou code AdSense
  linkUrl: text("linkUrl"), // URL de destination (pour type image)
  width: int("width"), // Largeur en pixels
  height: int("height"), // Hauteur en pixels
  impressions: int("impressions").default(0).notNull(), // Nombre d'affichages
  clicks: int("clicks").default(0).notNull(), // Nombre de clics
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(), // Revenus générés
  isActive: int("isActive").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdBanner = typeof adBanners.$inferSelect;
export type InsertAdBanner = typeof adBanners.$inferInsert;


/**
 * Product media table for managing product images and videos
 */
export const productMedia = mysqlTable("product_media", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["image", "video"]).default("image").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 50 }),
  fileSize: int("fileSize"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isMain: int("isMain").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductMedia = typeof productMedia.$inferSelect;
export type InsertProductMedia = typeof productMedia.$inferInsert;

/**
 * Product specifications table
 */
export const productSpecs = mysqlTable("product_specs", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductSpec = typeof productSpecs.$inferSelect;
export type InsertProductSpec = typeof productSpecs.$inferInsert;

/**
 * Product drafts table for work-in-progress products
 */
export const productDrafts = mysqlTable("product_drafts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId"),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }),
  categoryId: int("categoryId"),
  subcategoryId: int("subcategoryId"),
  price: decimal("price", { precision: 10, scale: 2 }),
  promoPrice: decimal("promoPrice", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  badge: varchar("badge", { length: 50 }),
  stockQty: int("stockQty"),
  availability: mysqlEnum("availability", ["in_stock", "out_of_stock", "preorder"]).default("in_stock"),
  shortDescription: text("shortDescription"),
  descriptionHtml: text("descriptionHtml"),
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  tags: text("tags"),
  promoStartDate: timestamp("promoStartDate"),
  promoEndDate: timestamp("promoEndDate"),
  currentStep: int("currentStep").default(1).notNull(),
  completionPercentage: int("completionPercentage").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductDraft = typeof productDrafts.$inferSelect;
export type InsertProductDraft = typeof productDrafts.$inferInsert;
