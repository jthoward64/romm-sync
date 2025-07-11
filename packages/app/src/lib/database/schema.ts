import "use-server";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const authSchema = sqliteTable("Auth", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  origin: text().notNull(),
  username: text().notNull(),
  password: text().notNull(),
});

export const retroarchSystemSchema = sqliteTable("RetroarchSystem", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  systemId: text().notNull(),
  rommSlug: text().notNull(),
  rommSystemId: integer().unique(),
});

export const retroarchCore = sqliteTable("RetroarchCore", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  fileName: text().notNull().unique(),
  downloaded: integer({ mode: "boolean" }).notNull(),
  retroarchSystemId: integer()
    .notNull()
    .references(() => retroarchSystemSchema.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});

export const retroarchRomSchema = sqliteTable("RetroarchRom", {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),
  retroarchPath: text().unique(),
  syncing: integer({ mode: "boolean" }).notNull().default(false),
  rommRomId: integer().notNull().unique(),
  rommFileId: integer(),
  targetCoreId: integer().references(() => retroarchCore.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});
