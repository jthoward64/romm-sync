import { Database } from "bun:sqlite";

export const db = new Database(":memory:", {
  create: true,
  readwrite: true,
  strict: true,
});

const schema = `
CREATE TABLE IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS retroarch_system (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS retroarch_core (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL UNIQUE,
  downloaded INTEGER NOT NULL,
  retroarch_system_id INTEGER NOT NULL,
  FOREIGN KEY (retroarch_system_id) REFERENCES retroarch_system(id)
);
CREATE TABLE IF NOT EXISTS restroarch_rom (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retroarch_path TEXT NOT NULL UNIQUE,
  syncing INTEGER NOT NULL DEFAULT 0,
  core_id INTEGER NOT NULL,
  FOREIGN KEY (core_id) REFERENCES retroarch_core(id),
  romm_rom_id INTEGER NOT NULL
);
`;

db.exec(schema);
