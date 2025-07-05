CREATE TABLE `Auth` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`origin` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RetroarchCore` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fileName` text NOT NULL,
	`downloaded` integer NOT NULL,
	`retroarchSystemId` integer NOT NULL,
	FOREIGN KEY (`retroarchSystemId`) REFERENCES `RetroarchSystem`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchCore_fileName_unique` ON `RetroarchCore` (`fileName`);--> statement-breakpoint
CREATE TABLE `RetroarchRom` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`retroarchPath` text,
	`syncing` integer DEFAULT false NOT NULL,
	`rommRomId` integer NOT NULL,
	`rommFileId` integer,
	`targetCoreId` integer,
	FOREIGN KEY (`targetCoreId`) REFERENCES `RetroarchCore`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchRom_retroarchPath_unique` ON `RetroarchRom` (`retroarchPath`);--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchRom_rommRomId_unique` ON `RetroarchRom` (`rommRomId`);--> statement-breakpoint
CREATE TABLE `RetroarchSystem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`systemId` text NOT NULL,
	`rommSlug` text NOT NULL,
	`rommSystemId` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RetroarchSystem_rommSystemId_unique` ON `RetroarchSystem` (`rommSystemId`);