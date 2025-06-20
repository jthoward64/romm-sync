import { db } from "./db";
import { DbRetroArchCore } from "./RetroArchCore";

export class DbRetroArchRom {
  constructor(
    public id: number,
    public retroarchPath: string | null,
    public syncing: boolean,
    public rommRomId: number,
    public rommFileId: number | null,
    public targetCoreId: number | null
  ) {}

  private static insertQuery = db.prepare(
    `INSERT INTO retroarch_rom (retroarch_path, syncing, romm_rom_id, romm_file_id, target_core_id)
     VALUES (?, ?, ?, ?, ?);`
  );
  public static insert(
    syncing: boolean,
    rommRomId: number,
    retroarchPath: string | null,
    rommFileId: number | null,
    targetCoreId: number | null
  ) {
    this.insertQuery.run(
      retroarchPath,
      syncing ? 1 : 0,
      rommRomId,
      rommFileId,
      targetCoreId
    );
  }

  private static updateQuery = db.prepare(
    `UPDATE retroarch_rom SET
     retroarch_path = ?,
     syncing = ?,
     romm_rom_id = ?,
     romm_file_id = ?,
     target_core_id = ?
     WHERE id = ?;`
  );
  public update() {
    DbRetroArchRom.updateQuery.run(
      this.retroarchPath,
      this.syncing ? 1 : 0,
      this.rommRomId,
      this.rommFileId,
      this.targetCoreId,
      this.id
    );
  }

  private static getQuery = db.prepare(
    `SELECT * FROM retroarch_rom WHERE id = ?`
  );
  public static async get(id: number): Promise<DbRetroArchRom | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new DbRetroArchRom(
      row.id,
      row.retroarch_path,
      Boolean(row.syncing),
      row.romm_rom_id,
      row.romm_file_id,
      row.target_core_id
    );
  }

  private static getByRommRomIdQuery = db.prepare(
    `SELECT * FROM retroarch_rom WHERE romm_rom_id = ?`
  );
  public static async getByRommRomId(
    rommRomId: number
  ): Promise<DbRetroArchRom | null> {
    const row = this.getByRommRomIdQuery.get(rommRomId) as any;
    if (!row) return null;
    return new DbRetroArchRom(
      row.id,
      row.retroarch_path,
      Boolean(row.syncing),
      row.romm_rom_id,
      row.romm_file_id,
      row.target_core_id
    );
  }

  private static allQuery = db.prepare(`SELECT * FROM retroarch_rom`);
  public static async all(): Promise<DbRetroArchRom[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map(
      (row) =>
        new DbRetroArchRom(
          row.id,
          row.retroarch_path,
          Boolean(row.syncing),
          row.romm_rom_id,
          row.romm_file_id,
          row.target_core_id
        )
    );
  }

  public async getCore(): Promise<DbRetroArchCore | null> {
    if (!this.targetCoreId) return null;
    return DbRetroArchCore.get(this.targetCoreId);
  }

  private static deleteQuery = db.prepare(
    `DELETE FROM retroarch_rom WHERE id = ?`
  );
  public async delete() {
    DbRetroArchRom.deleteQuery.run(this.id);
  }
}
