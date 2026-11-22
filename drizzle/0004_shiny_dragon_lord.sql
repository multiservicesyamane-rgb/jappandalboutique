CREATE TABLE "social_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"platforms" text NOT NULL,
	"intervalMinutes" integer DEFAULT 60 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "campaignId" integer;--> statement-breakpoint
ALTER TABLE "social_posts" ADD COLUMN "scheduledAt" timestamp;