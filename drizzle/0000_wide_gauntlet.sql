CREATE TYPE "public"."ad_type" AS ENUM('image', 'html', 'adsense');--> statement-breakpoint
CREATE TYPE "public"."availability" AS ENUM('in_stock', 'out_of_stock', 'preorder');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'contacted', 'confirmed', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "ad_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"position" varchar(50) NOT NULL,
	"type" "ad_type" DEFAULT 'image' NOT NULL,
	"content" text NOT NULL,
	"linkUrl" text,
	"width" integer,
	"height" integer,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"platform" varchar(100),
	"categoryId" integer,
	"productId" integer,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"imageUrl" text,
	"linkUrl" text,
	"isActive" integer DEFAULT 1 NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"emoji" varchar(10),
	"slug" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320),
	"phone" varchar(20) NOT NULL,
	"address" text,
	"totalOrders" integer DEFAULT 0 NOT NULL,
	"totalSpent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"icon" varchar(50),
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL,
	"target" varchar(20) DEFAULT '_self',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"productName" varchar(200) NOT NULL,
	"productPrice" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"totalAmount" numeric(12, 2) NOT NULL,
	"deliveryLocation" text,
	"customerPhone" varchar(20),
	"customerName" varchar(200),
	"customerId" integer,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200),
	"categoryId" integer,
	"subcategoryId" integer,
	"price" numeric(10, 2),
	"promoPrice" numeric(10, 2),
	"unit" varchar(50),
	"badge" varchar(50),
	"stockQty" integer,
	"availability" "availability" DEFAULT 'in_stock',
	"shortDescription" text,
	"descriptionHtml" text,
	"sku" varchar(100),
	"barcode" varchar(100),
	"metaTitle" varchar(200),
	"metaDescription" text,
	"tags" text,
	"promoStartDate" timestamp,
	"promoEndDate" timestamp,
	"currentStep" integer DEFAULT 1 NOT NULL,
	"completionPercentage" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"type" "media_type" DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"mimeType" varchar(50),
	"fileSize" integer,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isMain" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"unit" varchar(50),
	"imageUrl" text,
	"image2Url" text,
	"image3Url" text,
	"image4Url" text,
	"image5Url" text,
	"categoryId" integer NOT NULL,
	"badge" varchar(50),
	"inStock" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" varchar(100) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"type" varchar(50) NOT NULL,
	"description" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
