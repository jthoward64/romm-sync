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

  const systems: RetroArchTreeSystem[] = [];

  for (const [rom, core, system] of romsAndCores) {
    let existingSystem = systems.find((s) => s.systemId === system.systemId);
    if (!existingSystem) {
      existingSystem = {
        ...system,
        cores: [],
      };
      systems.push(existingSystem);
    }
    let existingCore = existingSystem.cores.find(
      (c) => c.fileName === core.fileName
    );
    if (!existingCore) {
      existingCore = {
        ...core,
        roms: [],
      };
      existingSystem.cores.push(existingCore);
    }
    existingCore.roms.push(rom);
  }

  systems.sort((a, b) => a.systemId.localeCompare(b.systemId));
  for (const system of systems) {
    system.cores.sort((a, b) => a.fileName.localeCompare(b.fileName));
    for (const core of system.cores) {
      core.roms.sort((a, b) => a.retroarchPath.localeCompare(b.retroarchPath));
    }
  }

  return systems;
}
