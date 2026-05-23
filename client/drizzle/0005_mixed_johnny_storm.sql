CREATE TABLE `ad_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`position` varchar(50) NOT NULL,
	`type` enum('image','html','adsense') NOT NULL DEFAULT 'image',
	`content` text NOT NULL,
	`linkUrl` text,
	`width` int,
	`height` int,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`isActive` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`platform` varchar(100),
	`categoryId` int,
	`productId` int,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_links_id` PRIMARY KEY(`id`)
);
