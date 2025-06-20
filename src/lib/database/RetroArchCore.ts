import type { PlatformSchema } from "@tajetaje/romm-api";
import { stat } from "node:fs/promises";
import type { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
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

  public static async getOrCreateFromInfo(
    info: LibRetroInfo,
    platforms: PlatformSchema[]
  ) {
    console.debug(`Checking for core ${info.infoFile.name} in database...`);
    const existing = await this.getByFileName(info.infoFile.name);
    if (existing) {
      console.debug(`Core ${info.infoFile.name} already exists in database.`);
      return existing;
    }
    console.debug(
      `Core ${info.infoFile.name} not found in database. Creating...`
    );
    const { systemId, systemName } = info;
    const paths = CorePaths.fromInfo(retroArchPaths, info);
    if (!paths) {
      console.debug(
        `No core paths found for ${info.infoFile.name}. Skipping core creation.`
      );
      return null;
    }

    const exists = await stat(paths.core)
      .then(() => true)
      .catch(() => false);

    if (!systemId) {
      console.debug(
        `No system ID found for ${info.infoFile.name}. Skipping core creation.`
      );
      return null;
    } else {
      console.debug(
        `Found system ID ${systemId} for core ${info.infoFile.name}.`
      );
    }

    let system = await DbRetroArchSystem.getBySystemId(systemId);

    if (!system) {
      console.debug(
        `System ID ${systemId} not found in database. Inserting new system.`
      );

      const rommSystem = platforms.find((p) => {
        const retroarchNames = [
          info.systemName?.toLowerCase(),
          info.systemId?.toLowerCase(),
        ].map((str) => str?.replaceAll("-", "").replaceAll("_", ""));
        const rommNames = [p.name.toLowerCase(), p.slug.toLowerCase()].map(
          (str) => str.replaceAll("-", "").replaceAll("_", "")
        );

        return retroarchNames.some((n) => n != null && rommNames.includes(n));
      });

      if (!rommSystem) {
        console.error(
          `No matching ROMM system found for ${systemId}. Cannot parse system.`
        );
        return null;
      }

      console.debug(
        `Found ROMM system ${rommSystem.name} (${JSON.stringify([
          systemId,
          rommSystem.slug,
          rommSystem.id === -1 ? null : rommSystem.id,
        ])} for system ID ${systemId}.`
      );

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

    console.debug(
      `Inserted core ${info.infoFile.name} with system ID ${system.id} and downloaded status ${exists}.`
    );

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
