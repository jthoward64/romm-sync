export const appDataDir = `${process.env.XDG_DATA_HOME ?? `${process.env.HOME ?? `/home/${process.env.USER}`}/.local/share`}/romm-sync`;

export const dbPath = `${appDataDir}/database.db`;
export const drizzleMigrationsPath = `${appDataDir}/drizzle`;

export async function ensureAppDir() {
  const { mkdir, stat } = await import("node:fs/promises");
  try {
    await stat(appDataDir);
  } catch (e) {
    if (typeof e === "object" && e && "code" in e && e.code === "ENOENT") {
      try {
        await mkdir(appDataDir, { recursive: true });
      } catch (mkdirError) {
        console.error(`Failed to create app data directory: ${mkdirError}`);
      }
    } else {
      console.error(`Error checking app data directory: ${e}`);
    }
  }
}
