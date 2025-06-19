import { db } from "./db";

export class DbRetroArchSystem {
  public static schema = ``;

  constructor(public id: number, public systemId: string) {}

  private static insertQuery = db.prepare(
    `INSERT INTO retroarch_system (system_id)
     VALUES (?);`
  );

  private static updateQuery = db.prepare(
    `UPDATE retroarch_system
     SET system_id = ?
     WHERE id = ?;`
  );

  public static async insert(systemId: string): Promise<void> {
    this.insertQuery.run(systemId);
  }

  public async update(): Promise<void> {
    if (!this.id) {
      throw new Error("Cannot update a record without an ID.");
    }
    DbRetroArchSystem.updateQuery.run(this.systemId, this.id);
  }

  private static getQuery = db.prepare(
    `SELECT * FROM retroarch_system WHERE id = ?`
  );

  public static async get(id: number): Promise<DbRetroArchSystem | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new DbRetroArchSystem(row.id, row.system_id);
  }

  private static systemIdQuery = db.prepare(
    `SELECT * FROM retroarch_system WHERE system_id = ?`
  );
  public static async getBySystemId(
    systemId: string
  ): Promise<DbRetroArchSystem | null> {
    const row = this.systemIdQuery.get(systemId) as any;
    if (!row) return null;
    return new DbRetroArchSystem(row.id, row.system_id);
  }

  private static allQuery = db.prepare(`SELECT * FROM retroarch_system`);

  public static async all(): Promise<DbRetroArchSystem[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map((row) => new DbRetroArchSystem(row.id, row.system_id));
  }

  private static deleteQuery = db.prepare(
    `DELETE FROM retroarch_system WHERE id = ?`
  );
  public static async delete(id: number): Promise<void> {
    this.deleteQuery.run(id);
  }
}
