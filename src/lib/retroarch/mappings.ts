import type { PlatformSchema } from "@tajetaje/romm-api";
import type { LibRetroInfo } from "./libretro-info/LibretroInfo";

export function rommSystemForRetroarchInfo(
  info: LibRetroInfo,
  platforms: PlatformSchema[]
) {
  function platformBySlug(target: string) {
    return platforms.find(({ slug }) => slug === target);
  }
  switch (info.systemId) {
    case "supervision":
      return platformBySlug("watara-slash-quickshot-supervision");
    case "playstation2":
      return platformBySlug("ps2");
    case "mega_drive":
      return platformBySlug("genesis-slash-megadrive");
    case "commodore_amiga":
      return platformBySlug("amiga-cd32");
    case "game_boy":
      return platformBySlug("gb");
    case "gamecube":
      return platformBySlug("ngc");
    case "master_system":
      return platformBySlug("sms");
    case "commodore_c128":
      return platformBySlug("c64");
    case "commodore_c64dtv":
      return platformBySlug("commodore_c64dtv");
    case "commodore_plus4":
      return platformBySlug("c-plus-4");
    case "commodore_pet":
      return platformBySlug("cpet");

    // Ignore these systems
    case "2048":
    case "adv_test_core":
    case "bgdi":
    case "bomberman":
    case "cdi":
    case "cdi2015":
    case "chailove":
    case "chip_8":
    case "commodore_c64_supercpu":
    case "commodore_c64dtv":
    case "commodore_cbm2":
    case "commodore_cbm5x0":
    case "cpc":
    case "craft":
    case "cruzes":
    case "daphne":
    case "dice":
    case "dinothawr":
    case "doom_3":
    case "doom":
    case "doukutsu-rs":
    case "ep128":
    case "fb_alpha":
    case "game_music":
    case "gong":
    case "hbmame":
    case "J2ME":
    case "jumpnbump":
    case "laserdisc":
    case "lowresnx":
    case "mac68k":
    case "mame":
    case "mega_duck":
    case "mess":
    case "movie":
    case "music":
    case "neogeo":
    case "nxengine":
    case "odyssey2":
    case "openlara":
    case "p2000t":
    case "pc_88":
    case "pc_98":
    case "pc_engine":
    case "pcxt":
    case "pico8":
    case "puzzlescript":
    case "quake_1":
    case "quake_2":
    case "quake_3":
    case "redbook":
    case "scummvm":
    case "superbroswar":
    case "tamagotchi":
    case "taylor":
    case "ti_83":
    case "tic80":
    case "uw8":
    case "uzebox":
    case "vaporspec":
    case "vircon32":
    case "wasm4":
    case "wolfenstein3d":
    case "xrick":
    case "zmachine":
    case "zx_spectrum":
    case "zx81":
      return null;

    // Default to comparing the names
    default:
      return platforms
        .map(
          (p) =>
            [
              [p.name.toLowerCase(), p.slug.toLowerCase()].map((str) =>
                str.replaceAll("-", "").replaceAll("_", "")
              ),
              p,
            ] as const
        )
        .find(([rommNames]) => {
          const retroarchNames = [
            info.systemName?.toLowerCase(),
            info.systemId?.toLowerCase(),
          ].map((str) => str?.replaceAll("-", "").replaceAll("_", ""));

          return retroarchNames.some((n) => n != null && rommNames.includes(n));
        })?.[1];
  }
}
