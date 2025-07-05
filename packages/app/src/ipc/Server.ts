import { eq } from "drizzle-orm";
import { db } from "../lib/database/db.js";
import { authSchema, retroarchRomSchema } from "../lib/database/schema.js";
import { loadFromRomm } from "../lib/init.js";
import { getAllRoms } from "../lib/interface.js";
import type { Rom } from "../lib/Rom.js";
import { RommApiClient } from "../lib/romm/RomM.js";
import { syncJob } from "../lib/sync/sync.js";
import type { ipcActions } from "./actions.js";

export const IpcServer = {
  async getDbRoms(): Promise<{ roms: Rom[] }> {
    return { roms: await getAllRoms() };
  },

  async setSync(arg: {
    id: number;
    enabled: boolean;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    // const rom = await DbRetroArchRom.getByRommRomId(arg.id);
    const rom = await db.query.retroarchRomSchema.findFirst({
      where: (table, { eq }) => eq(table.rommRomId, arg.id),
    });
    if (!rom) {
      console.log(`No ROM found with ID ${arg.id}. Creating a new entry.`);
      await db.insert(retroarchRomSchema).values({
        syncing: arg.enabled,
        rommRomId: arg.id,
      });
    } else {
      console.log(
        `Updating ROM with ID ${arg.id} to set syncing to ${arg.enabled}.`
      );
      await db
        .update(retroarchRomSchema)
        .set({
          syncing: arg.enabled,
          rommFileId: arg.enabled ? retroarchRomSchema.rommFileId : null,
          retroarchPath: arg.enabled ? retroarchRomSchema.retroarchPath : null,
          targetCoreId: arg.enabled ? retroarchRomSchema.targetCoreId : null,
        })
        .where(eq(retroarchRomSchema.rommRomId, arg.id));
    }
    const newRom = await db.query.retroarchRomSchema.findFirst({
      where: (table, { eq }) => eq(table.rommRomId, arg.id),
    });
    if (!newRom) {
      throw new Error(`ROM with ID ${arg.id} not found after update.`);
    }

    await syncJob.trigger();

    return { rom: newRom };
  },

  async selectFile(arg: {
    romId: number;
    fileId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    const rom = await db
      .update(retroarchRomSchema)
      .set({
        rommFileId: arg.fileId,
      })
      .where(eq(retroarchRomSchema.rommRomId, arg.romId))
      .returning()
      .then((rows) => rows[0]);
    if (!rom) {
      throw new Error(`ROM with ID ${arg.romId} not found.`);
    }
    await syncJob.trigger();
    return { rom };
  },

  async setTargetCore(arg: {
    romId: number;
    coreId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    const rom = await db
      .update(retroarchRomSchema)
      .set({
        targetCoreId: arg.coreId,
      })
      .where(eq(retroarchRomSchema.rommRomId, arg.romId))
      .returning()
      .then((rows) => rows[0]);
    if (!rom) {
      throw new Error(`ROM with ID ${arg.romId} not found.`);
    }
    await syncJob.trigger();
    return { rom };
  },

  async log(arg: { message: string }): Promise<void> {
    console.log(`[IPC LOG] ${arg.message}`);
  },

  async getStatus(): Promise<{
    status: {
      rommApiReady: boolean;
    };
  }> {
    return {
      status: {
        rommApiReady: RommApiClient.isInitialized,
      },
    };
  },

  async getSettings(): Promise<{
    settings: {
      username: string;
      passwordSet: boolean;
      origin: string;
    } | null;
  }> {
    const auth = await db.query.authSchema.findFirst();
    if (!auth) {
      return { settings: null };
    }
    return {
      settings: {
        username: auth.username,
        passwordSet: auth.password !== null,
        origin: auth.origin,
      },
    };
  },

  async testSettings({
    username,
    newPassword,
    origin,
  }: {
    username: string;
    newPassword: string | null;
    origin: string;
  }): Promise<{
    ok: boolean;
    error?: { message: string };
  }> {
    try {
      const auth = await db.query.authSchema.findFirst({
        where: (table, { eq }) => eq(table.origin, origin),
      });
      if (!auth) {
        throw new Error("No settings found for the specified origin.");
      }
      RommApiClient.init({
        username,
        password: newPassword ?? auth.password,
        origin,
      });

      await RommApiClient.instance.usersApi.getCurrentUserApiUsersMeGet();
      RommApiClient.init(auth);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : `Unknown error: ${String(error)}`,
        },
      };
    }
  },

  async setSettings(arg: {
    username: string;
    password: string | null;
    origin: string;
  }): Promise<void> {
    const auth = await db.query.authSchema.findFirst({
      where: (table, { eq }) => eq(table.origin, arg.origin),
    });
    let updated: typeof authSchema.$inferInsert | undefined;
    if (!auth) {
      if (!arg.username || !arg.password || !arg.origin) {
        throw new Error("Username, password, and origin must be provided.");
      }
      updated = await db
        .insert(authSchema)
        .values({
          username: arg.username,
          password: arg.password,
          origin: arg.origin,
        })
        .returning()
        .then((rows) => rows[0]);
    } else {
      updated = await db
        .update(authSchema)
        .set({
          username: arg.username,
          password: arg.password || authSchema.password, // Keep existing password if null or empty
          origin: arg.origin,
        })
        .returning()
        .then((rows) => rows[0]);
    }
    if (!updated) {
      throw new Error("Failed to update settings.");
    } else {
      RommApiClient.init(updated);
      await loadFromRomm();
    }
  },
} satisfies Record<
  (typeof ipcActions)[number],
  // biome-ignore lint/suspicious/noExplicitAny: This is a type check
  (...args: any[]) => Promise<any>
>;

export type IpcResponse<T> =
  | (T & { ok: true })
  | { ok: false; error: { message: string } };

export type IpcAction = keyof typeof IpcServer;

export type IpcArgument<Action extends IpcAction> = Parameters<
  (typeof IpcServer)[Action]
>[0];
export type IpcResult<Action extends IpcAction> = Awaited<
  ReturnType<(typeof IpcServer)[Action]>
>;
