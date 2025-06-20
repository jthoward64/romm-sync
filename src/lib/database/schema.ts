import { sql } from "drizzle-orm";
import {
  integer,
  numeric,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const prismaMigrations = sqliteTable("_prisma_migrations", {
  id: text().primaryKey().notNull(),
  checksum: text().notNull(),
  finishedAt: numeric("finished_at"),
  migrationName: text("migration_name").notNull(),
  logs: text(),
  rolledBackAt: numeric("rolled_back_at"),
  startedAt: numeric("started_at")
    .default(sql`(current_timestamp)`)
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const auth = sqliteTable("Auth", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  origin: text().notNull(),
  username: text().notNull(),
  password: text().notNull(),
});

export const retroarchSystem = sqliteTable(
  "RetroarchSystem",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    systemId: text().notNull(),
    rommSlug: text().notNull(),
    rommSystemId: integer(),
  },
  (table) => [uniqueIndex("RetroarchSystem_systemId_key").on(table.systemId)]
);

export const retroarchCore = sqliteTable(
  "RetroarchCore",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    fileName: text().notNull(),
    downloaded: numeric().notNull(),
    retroarchSystemId: integer()
      .notNull()
      .references(() => retroarchSystem.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [uniqueIndex("RetroarchCore_fileName_key").on(table.fileName)]
);

export const retroarchRom = sqliteTable(
  "RetroarchRom",
  {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    retroarchPath: text(),
    syncing: numeric().notNull(),
    rommRomId: integer().notNull(),
    rommFileId: integer(),
    targetCoreId: integer().references(() => retroarchCore.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    uniqueIndex("RetroarchRom_rommRomId_key").on(table.rommRomId),
    uniqueIndex("RetroarchRom_retroarchPath_key").on(table.retroarchPath),
  ]
);
