import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, serial } from "drizzle-orm/pg-core";

// Define Enums
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const statusEnum = pgEnum("status", ["pending", "contacted", "confirmed", "delivered", "cancelled"]);
export const adTypeEnum = pgEnum("ad_type", ["image", "html", "adsense"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const availabilityEnum = pgEnum("availability", ["in_stock", "out_of_stock", "preorder"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing products
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table for the e-commerce catalog
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  imageUrl: text("imageUrl"),
  image2Url: text("image2Url"),
  image3Url: text("image3Url"),
  image4Url: text("image4Url"),
  image5Url: text("image5Url"),
  categoryId: integer("categoryId").notNull(),
  badge: varchar("badge", { length: 50 }),
  inStock: integer("inStock").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders tracking table for WhatsApp orders
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  productPrice: decimal("productPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  deliveryLocation: text("deliveryLocation"),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerName: varchar("customerName", { length: 200 }),
  customerId: integer("customerId"),
  status: statusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Customers table for tracking customer information
 */
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  totalOrders: integer("totalOrders").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Settings table for site configuration
 */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Banners table for homepage content management
 */
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  linkUrl: text("linkUrl"),
  isActive: integer("isActive").default(1).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Site content table for CMS
 */
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

/**
 * Menu items table for dynamic menu management
 */
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isVisible: integer("isVisible").default(1).notNull(),
  target: varchar("target", { length: 20 }).default("_self"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Affiliate links table for monetization
 */
export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  url: text("url").notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 100 }),
  categoryId: integer("categoryId"),
  productId: integer("productId"),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Ad banners table for advertising monetization
 */
export const adBanners = pgTable("ad_banners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  type: adTypeEnum("type").default("image").notNull(),
  content: text("content").notNull(),
  linkUrl: text("linkUrl"),
  width: integer("width"),
  height: integer("height"),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: integer("isActive").default(1).notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdBanner = typeof adBanners.$inferSelect;
export type InsertAdBanner = typeof adBanners.$inferInsert;

/**
 * Product media table for managing product images and videos
 */
export const productMedia = pgTable("product_media", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  type: mediaTypeEnum("type").default("image").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 50 }),
  fileSize: integer("fileSize"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isMain: integer("isMain").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductMedia = typeof productMedia.$inferSelect;
export type InsertProductMedia = typeof productMedia.$inferInsert;

/**
 * Product specifications table
 */
export const productSpecs = pgTable("product_specs", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductSpec = typeof productSpecs.$inferSelect;
export type InsertProductSpec = typeof productSpecs.$inferInsert;

/**
 * Product drafts table for work-in-progress products
 */
export const productDrafts = pgTable("product_drafts", {
  id: serial("id").primaryKey(),
  productId: integer("productId"),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }),
  categoryId: integer("categoryId"),
  subcategoryId: integer("subcategoryId"),
  price: decimal("price", { precision: 10, scale: 2 }),
  promoPrice: decimal("promoPrice", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  badge: varchar("badge", { length: 50 }),
  stockQty: integer("stockQty"),
  availability: availabilityEnum("availability").default("in_stock"),
  shortDescription: text("shortDescription"),
  descriptionHtml: text("descriptionHtml"),
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  metaTitle: varchar("metaTitle", { length: 200 }),
  metaDescription: text("metaDescription"),
  tags: text("tags"),
  promoStartDate: timestamp("promoStartDate"),
  promoEndDate: timestamp("promoEndDate"),
  currentStep: integer("currentStep").default(1).notNull(),
  completionPercentage: integer("completionPercentage").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductDraft = typeof productDrafts.$inferSelect;
export type InsertProductDraft = typeof productDrafts.$inferInsert;
