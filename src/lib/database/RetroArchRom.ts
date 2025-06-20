import { db } from "./db";
import { type CompleteCore } from "./RetroArchCore";

export class DbRetroArchRom {
  public static schema = ``;

  constructor(
    public id: number,
    public retroarchPath: string | null,
    public syncing: boolean,
    public rommRomId: number
  ) {}

  private static insertQuery = db.prepare(
    `INSERT INTO retroarch_rom (retroarch_path, syncing,  romm_rom_id)
     VALUES (?, ?, ?);`
  );
  public static insert(
    syncing: boolean,
    rommRomId: number,
    retroarchPath: string | null
  ) {
    this.insertQuery.run(retroarchPath, syncing ? 1 : 0, rommRomId);
  }

  private static updateQuery = db.prepare(
    `UPDATE retroarch_rom SET
     retroarch_path = ?,
     syncing = ?,
     romm_rom_id = ?
     WHERE id = ?;`
  );
  public update() {
    DbRetroArchRom.updateQuery.run(
      this.retroarchPath,
      this.syncing ? 1 : 0,
      this.rommRomId,
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
      row.romm_rom_id
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
          row.romm_rom_id
        )
    );
  }

  private static deleteQuery = db.prepare(
    `DELETE FROM retroarch_rom WHERE id = ?`
  );
  public async delete() {
    DbRetroArchRom.deleteQuery.run(this.id);
  }
}

interface CompleteRom extends DbRetroArchRom {
  core: CompleteCore;
}
