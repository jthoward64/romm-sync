CREATE TABLE `Auth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`origin` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `_prisma_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`finished_at` numeric,
	`migration_name` text NOT NULL,
	`logs` text,
	`rolled_back_at` numeric,
	`started_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`applied_steps_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RetroarchCore` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fileName` text NOT NULL,
	`downloaded` numeric NOT NULL,
	`retroarchSystemId` integer NOT NULL,
	FOREIGN KEY (`retroarchSystemId`) REFERENCES `RetroarchSystem`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchCore_fileName_key` ON `RetroarchCore` (`fileName`);--> statement-breakpoint
CREATE TABLE `RetroarchRom` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`retroarchPath` text,
	`syncing` numeric NOT NULL,
	`rommRomId` integer NOT NULL,
	`rommFileId` integer,
	`targetCoreId` integer,
	FOREIGN KEY (`targetCoreId`) REFERENCES `RetroarchCore`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchRom_rommRomId_key` ON `RetroarchRom` (`rommRomId`);--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchRom_retroarchPath_key` ON `RetroarchRom` (`retroarchPath`);--> statement-breakpoint
CREATE TABLE `RetroarchSystem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`systemId` text NOT NULL,
	`rommSlug` text NOT NULL,
	`rommSystemId` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchSystem_systemId_key` ON `RetroarchSystem` (`systemId`);