import type { PlatformSchema } from "@tajetaje/romm-api";
import { stat } from "node:fs/promises";
import type { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
import { rommSystemForRetroarchInfo } from "../retroarch/mappings";
import { CorePaths, retroArchPaths } from "../retroarch/paths";
import { db } from "./db";
import { DbRetroArchSystem } from "./RetroArchSystem";

export class DbRetroArchCore {
  public static schema = ``;

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

  /**
   * Retrieves a core from the database based on the provided LibRetroInfo and platforms.
   * If the core does not exist, it creates a new entry in the database.
   *
   * @param platforms - An array of PlatformSchema objects representing available platforms.
   * @returns A promise that resolves to the DbRetroArchCore instance or null if creation fails.
   */
  public static async getOrCreateFromInfo(
    info: LibRetroInfo,
    platforms: PlatformSchema[]
  ) {
    const existing = await this.getByFileName(info.infoFile.name);
    if (existing) {
      return existing;
    }
    const { systemId, systemName } = info;
    const paths = CorePaths.fromInfo(retroArchPaths, info);
    if (!paths) {
      return null;
    }

    const exists = await stat(paths.core)
      .then(() => true)
      .catch((error) => {
        if (error.code === "ENOENT") {
          return false;
        } else {
          console.error(`Error checking core file ${paths.core}:`, error);
          throw error;
        }
      });

    if (!systemId) {
      return null;
    }

    let system = await DbRetroArchSystem.getBySystemId(systemId);

    if (!system) {
      const rommSystem = rommSystemForRetroarchInfo(info, platforms);

      if (!rommSystem) {
        if (rommSystem === undefined) {
          console.error(
            `No matching ROMM system found for ${systemId}. Cannot parse system.`
          );
        }
        return null;
      }

      await DbRetroArchSystem.insert(
        systemId,
        rommSystem.slug,
        rommSystem.id === -1 ? null : rommSystem.id
      );

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

  public async getSystem(): Promise<DbRetroArchSystem | null> {
    return DbRetroArchSystem.get(this.retroarchSystemId);
  }

  public async withSystem(): Promise<CompleteCore | null> {
    const system = await this.getSystem();
    if (!system) return null;
    return {
      ...this,
      system: system,
    };
  }
}

export interface CompleteCore extends DbRetroArchCore {
  system: DbRetroArchSystem;
}
