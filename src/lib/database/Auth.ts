import { db } from "./db";

export class Auth {
  public static schema = `CREATE TABLE IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );`;

  constructor(
    public id: number,
    public token: string,
    public expiresAt: number
  ) {}

  private static insertQuery = db.prepare(
    `INSERT INTO auth (token, expires_at)
     VALUES (?, ?)`
  );
  public static insert(token: string, expiresAt: number): void {
    this.insertQuery.run(token, expiresAt);
  }

  private static updateQuery = db.prepare(
    `UPDATE auth SET token = ?, expires_at = ? WHERE id = ?`
  );
  public update(): void {
    Auth.updateQuery.run(this.token, this.expiresAt, this.id);
  }

  private static getQuery = db.prepare(`SELECT * FROM auth WHERE id = ?`);
  public static async get(id: number): Promise<Auth | null> {
    const row = this.getQuery.get(id) as any;
    if (!row) return null;
    return new Auth(row.id, row.token, row.expires_at);
  }

  private static allQuery = db.prepare(`SELECT * FROM auth`);
  public static async all(): Promise<Auth[]> {
    const rows = this.allQuery.all() as any[];
    return rows.map((row) => new Auth(row.id, row.token, row.expires_at));
  }

  private static deleteQuery = db.prepare(`DELETE FROM auth WHERE id = ?`);
  public static async delete(id: number): Promise<void> {
    this.deleteQuery.run(id);
  }
}
