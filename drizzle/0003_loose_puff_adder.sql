CREATE TABLE "social_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"productName" varchar(200),
	"platform" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"message" text,
	"imageUrl" text,
	"link" text,
	"externalId" varchar(200),
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"publishedAt" timestamp
);
