import { db } from "./db";

export class RetroArchRom {
  public static schema = `CREATE TABLE IF NOT EXISTS restroarch_rom (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retroarch_path TEXT NOT NULL UNIQUE,
  syncing INTEGER NOT NULL DEFAULT 0,
  core_id INTEGER NOT NULL,
  FOREIGN KEY (core_id) REFERENCES retroarch_core(id)
  romm_rom_id INTEGER NOT NULL
);`;

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
    RetroArchRom.updateQuery.run(
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
  public static async get(id: number): Promise<RetroArchRom | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new RetroArchRom(
      row.id,
      row.retroarch_path,
      Boolean(row.syncing),
      row.core_id,
      row.romm_rom_id
    );
  }

  private static allQuery = db.prepare(`SELECT * FROM restroarch_rom`);
  public static async all(): Promise<RetroArchRom[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map(
      (row) =>
        new RetroArchRom(
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
    RetroArchRom.deleteQuery.run(this.id);
  }
}
