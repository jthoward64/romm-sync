import { db } from "./db";
import { DbRetroArchCore, type CompleteCore } from "./RetroArchCore";

export class DbRetroArchRom {
  public static schema = ``;

  constructor(
    public id: number,
    public retroarchPath: string,
    public syncing: boolean,
    public coreId: number,
    public rommRomId: number
  ) {}

  private static insertQuery = db.prepare(
    `INSERT INTO restroarch_rom (retroarch_path, syncing, core_id, romm_rom_id)
     VALUES (?, ?, ?, ?);`
  );
  public static insert(
    retroarchPath: string,
    syncing: boolean,
    coreId: number,
    rommRomId: number
  ) {
    this.insertQuery.run(retroarchPath, syncing ? 1 : 0, coreId, rommRomId);
  }

  private static updateQuery = db.prepare(
    `UPDATE restroarch_rom SET
     retroarch_path = ?,
     syncing = ?,
     core_id = ?,
     romm_rom_id = ?
     WHERE id = ?;`
  );
  public update() {
    DbRetroArchRom.updateQuery.run(
      this.retroarchPath,
      this.syncing ? 1 : 0,
      this.coreId,
      this.rommRomId,
      this.id
    );
  }

  private static getQuery = db.prepare(
    `SELECT * FROM restroarch_rom WHERE id = ?`
  );
  public static async get(id: number): Promise<DbRetroArchRom | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new DbRetroArchRom(
      row.id,
      row.retroarch_path,
      Boolean(row.syncing),
      row.core_id,
      row.romm_rom_id
    );
  }

  private static allQuery = db.prepare(`SELECT * FROM restroarch_rom`);
  public static async all(): Promise<DbRetroArchRom[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map(
      (row) =>
        new DbRetroArchRom(
          row.id,
          row.retroarch_path,
          Boolean(row.syncing),
          row.core_id,
          row.romm_rom_id
        )
    );
  }

  private static deleteQuery = db.prepare(
    `DELETE FROM restroarch_rom WHERE id = ?`
  );
  public async delete() {
    DbRetroArchRom.deleteQuery.run(this.id);
  }

  public async getCore(): Promise<DbRetroArchCore | null> {
    return DbRetroArchCore.get(this.coreId);
  }

  public async withCore(): Promise<CompleteRom | null> {
    const core = await this.getCore();
    if (!core) return null;
    return {
      ...this,
      core: core as CompleteCore,
    };
  }
}

interface CompleteRom extends DbRetroArchRom {
  core: CompleteCore;
}
