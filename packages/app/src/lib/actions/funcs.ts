"use server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/database/db.js";
import { authSchema, retroarchRomSchema } from "@/lib/database/schema.js";
import { loadFromRomm } from "@/lib/init.js";
import { RommApiClient } from "@/lib/romm/RomM.js";
import { syncJob } from "@/lib/sync/sync.js";
import { safeAction } from "@/lib/actions/safeAction.js";

export const setSync = safeAction(
  async (arg: {
    id: number;
    enabled: boolean;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> => {
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
  }
);

export const selectFile = safeAction(
  async (arg: {
    romId: number;
    fileId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> => {
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
  }
);

export const setTargetCore = safeAction(
  async (arg: {
    romId: number;
    coreId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> => {
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
  }
);

export const getSettings = safeAction(
  async (): Promise<{
    settings: {
      username: string;
      passwordSet: boolean;
      origin: string;
    } | null;
  }> => {
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
  }
);

export const testSettings = async ({
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
}> => {
  try {
    const auth = await db.query.authSchema.findFirst({
      where: (table, { eq }) => eq(table.origin, origin),
    });
    if (!auth) {
      throw new Error("No settings found for the specified origin.");
    }

    const client = new RommApiClient({
      username,
      password: newPassword ?? auth.password,
      origin,
    });
    await client.usersApi.getCurrentUserApiUsersMeGet();

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
};

export const setSettings = safeAction(
  async (arg: {
    username: string;
    password: string | null;
    origin: string;
  }): Promise<void> => {
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
          password: arg.password || authSchema.password,
          origin: arg.origin,
        })
        .returning()
        .then((rows) => rows[0]);
    }
    if (!updated) {
      throw new Error("Failed to update settings.");
    } else {
      await loadFromRomm();
    }
  }
);
