import { relations } from "drizzle-orm/relations";
import { retroarchCore, retroarchRom, retroarchSystem } from "./schema";

export const retroarchCoreRelations = relations(
  retroarchCore,
  ({ one, many }) => ({
    retroarchSystem: one(retroarchSystem, {
      fields: [retroarchCore.retroarchSystemId],
      references: [retroarchSystem.id],
    }),
    retroarchRoms: many(retroarchRom),
  })
);

export const retroarchSystemRelations = relations(
  retroarchSystem,
  ({ many }) => ({
    retroarchCores: many(retroarchCore),
  })
);

export const retroarchRomRelations = relations(retroarchRom, ({ one }) => ({
  retroarchCore: one(retroarchCore, {
    fields: [retroarchRom.targetCoreId],
    references: [retroarchCore.id],
  }),
}));
