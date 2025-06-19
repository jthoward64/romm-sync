import { db } from "./db";

export class DbAuth {
  public static schema = ``;

  constructor(
    public id: number,
    public origin: string,
    public username: string,
    public password: string
  ) {}

  private static getQuery = db.prepare(`SELECT * FROM auth LIMIT 1`);
  public static async get(): Promise<DbAuth | null> {
    const row = this.getQuery.get() as any;
    if (!row) return null;
    return new DbAuth(row.id, row.origin, row.username, row.password);
  }

  private static insertQuery = db.prepare(
    `INSERT INTO auth (origin, username, password) VALUES (?, ?, ?);`
  );
  public static insert(
    origin: string,
    username: string,
    password: string
  ): void {
    this.insertQuery.run(origin, username, password);
  }

  public static async initFromEnv() {
    const username = Bun.env.USERNAME;
    const password = Bun.env.PASSWORD;
    const origin = Bun.env.ORIGIN;
    if (!username || !password || !origin) {
      throw new Error(
        "Environment variables USERNAME, PASSWORD, and ORIGIN must be set."
      );
    }
    // Check if auth already exists
    const existingAuth = await DbAuth.get();
    if (existingAuth) {
      console.log("Auth already exists, skipping initialization.");
      return;
    }
    // Insert new auth
    DbAuth.insert(origin, username, password);
    console.log("Auth initialized with provided environment variables.");
  }
}
