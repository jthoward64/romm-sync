import { stat } from "node:fs/promises";
import type { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
import { CorePaths, retroArchPaths } from "../retroarch/paths";
import { db } from "./db";
import { DbRetroArchSystem } from "./RetroArchSystem";

export class DbRetroArchCore {
  public static schema = `CREATE TABLE IF NOT EXISTS retroarch_core (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL UNIQUE,
  downloaded INTEGER NOT NULL,
  retroarch_system_id INTEGER NOT NULL,
  FOREIGN KEY (retroarch_system_id) REFERENCES retroarch_system(id)
);`;

  constructor(
    public id: number,
    public fileName: string,
    public downloaded: boolean,
    public retroarchSystemId: number
  ) {}

  private static insertQuery = db.prepare(
    `INSERT INTO retroarch_core (file_name, downloaded, retroarch_system_id)
     VALUES (?, ?, ?);`
  );
  public static insert(
    fileName: string,
    downloaded: boolean,
    retroarchSystemId: number
  ): void {
    this.insertQuery.run(fileName, downloaded ? 1 : 0, retroarchSystemId);
  }

  private static updateQuery = db.prepare(
    `UPDATE retroarch_core
     SET file_name = ?, downloaded = ?, retroarch_system_id = ?
     WHERE id = ?;`
  );
  public update(): void {
    DbRetroArchCore.updateQuery.run(
      this.fileName,
      this.downloaded ? 1 : 0,
      this.retroarchSystemId,
      this.id
    );
  }

  private static getQuery = db.prepare(
    `SELECT * FROM retroarch_core WHERE id = ?`
  );
  public static async get(id: number): Promise<DbRetroArchCore | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new DbRetroArchCore(
      row.id,
      row.file_name,
      Boolean(row.downloaded),
      row.retroarch_system_id
    );
  }

  private static fileNameQuery = db.prepare(
    `SELECT * FROM retroarch_core WHERE file_name = ?`
  );
  private static async getByFileName(
    fileName: string
  ): Promise<DbRetroArchCore | null> {
    const row = this.fileNameQuery.get(fileName) as any;
    if (!row) return null;
    return new DbRetroArchCore(
      row.id,
      row.file_name,
      Boolean(row.downloaded),
      row.retroarch_system_id
    );
  }

  public static async getOrCreateFromInfo(info: LibRetroInfo) {
    const existing = await this.getByFileName(info.infoFile.name);
    if (existing) {
      return existing;
    }
    const { systemId } = info;
    const paths = CorePaths.fromInfo(retroArchPaths, info);
    const exists = await stat(paths.core)
      .then(() => true)
      .catch(() => false);
    if (!systemId) {
      console.warn(
        `Core ${info.infoFile.name} does not have a system ID, skipping insertion.`
      );
      return null;
    }
    let system = await DbRetroArchSystem.getBySystemId(systemId);
    if (!system) {
      await DbRetroArchSystem.insert(systemId);
      system = await DbRetroArchSystem.getBySystemId(systemId);
    }
    if (!system) {
      console.error(
        `Failed to retrieve system ID for ${systemId} after insertion.`
      );
      return null;
    }
    this.insert(info.infoFile.name, exists, system.id);
    return this.getByFileName(info.infoFile.name);
  }

  private static allQuery = db.prepare(`SELECT * FROM retroarch_core`);
  public static async all(): Promise<DbRetroArchCore[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map(
      (row) =>
        new DbRetroArchCore(
          row.id,
          row.file_name,
          Boolean(row.downloaded),
          row.retroarch_system_id
        )
    );
  }

  private static deleteQuery = db.prepare(
    `DELETE FROM retroarch_core WHERE id = ?`
  );
  public static async delete(id: number): Promise<void> {
    this.deleteQuery.run(id);
  }
}
