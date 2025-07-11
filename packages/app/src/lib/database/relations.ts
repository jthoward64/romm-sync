import "use-server";

import { relations } from "drizzle-orm/relations";
import {
  retroarchCore,
  retroarchRomSchema,
  retroarchSystemSchema,
} from "./schema.js";

export const retroarchCoreRelations = relations(
  retroarchCore,
  ({ one, many }) => ({
    retroarchSystem: one(retroarchSystemSchema, {
      fields: [retroarchCore.retroarchSystemId],
      references: [retroarchSystemSchema.id],
    }),
    retroarchRoms: many(retroarchRomSchema),
  })
);

export const retroarchSystemRelations = relations(
  retroarchSystemSchema,
  ({ many }) => ({
    retroarchCores: many(retroarchCore),
  })
);

export const retroarchRomRelations = relations(
  retroarchRomSchema,
  ({ one }) => ({
    retroarchCore: one(retroarchCore, {
      fields: [retroarchRomSchema.targetCoreId],
      references: [retroarchCore.id],
    }),
  })
);
