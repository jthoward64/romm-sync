import type { NonFunctionProperties } from "../types";
import type { DbRetroArchCore } from "./RetroArchCore";
import { DbRetroArchRom } from "./RetroArchRom";
import type { DbRetroArchSystem } from "./RetroArchSystem";

export interface RetroArchTreeSystem
  extends NonFunctionProperties<DbRetroArchSystem> {
  cores: RetroArchTreeCore[];
}

export interface RetroArchTreeCore
  extends NonFunctionProperties<DbRetroArchCore> {
  roms: DbRetroArchRom[];
}

export async function getAllRoms() {
  const roms = await DbRetroArchRom.all();
  const romsAndCores = (
    await Promise.all(
      roms.map(async (rom) => {
        const core = await rom.getCore();
        const system = await core?.getSystem();
        return [rom, core, system] as const;
      })
    )
  ).filter(
    (arr): arr is [DbRetroArchRom, DbRetroArchCore, DbRetroArchSystem] =>
      arr[0] !== null && arr[1] !== null && arr[2] !== null
  );

  const systemsMap = new Map<string, RetroArchTreeSystem>();

  for (const [rom, core, system] of romsAndCores) {
    if (!systemsMap.has(system.systemId)) {
      systemsMap.set(system.systemId, {
        ...system,
        cores: [],
      });
    }
    const treeSystem = systemsMap.get(system.systemId)!;

    if (!treeSystem.cores.some((c) => c.id === core.id)) {
      treeSystem.cores.push({
        ...core,
        roms: [],
      });
    }
    const treeCore = treeSystem.cores.find((c) => c.id === core.id)!;

    treeCore.roms.push(rom);
  }

  const systems = Array.from(systemsMap.values());
  systems.sort((a, b) => a.systemId.localeCompare(b.systemId));
  for (const system of systems) {
    system.cores.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }
  return systems;
}
