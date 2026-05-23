CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`url` varchar(500) NOT NULL,
	`icon` varchar(50),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isVisible` int NOT NULL DEFAULT 1,
	`target` varchar(20) DEFAULT '_self',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` varchar(100) NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`type` varchar(50) NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_content_id` PRIMARY KEY(`id`)
);
