import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { type InfoFile, parseInfoFile } from "./InfoFile.js";

export class LibRetroInfo {
  public firmware: LibRetroFirmware[] | undefined;

  public displayName: string | undefined;
  public authors: string | undefined;
  public supportedExtensions: string | undefined;
  public coreName: string | undefined;
  public categories: string | undefined;
  public license: string | undefined;
  public permissions: string | undefined;
  public displayVersion: string | undefined;

  public systemName: string | undefined;
  public systemId: string | undefined;
  public manufacturer: string | undefined;

  public database: string | undefined;
  public supportsNoGame: boolean | undefined;
  public singlePurpose: boolean | undefined;
  public saveState: boolean | undefined;
  public saveStateFeatures: string | undefined;
  public cheats: boolean | undefined;
  public inputDescriptors: boolean | undefined;
  public memoryDescriptors: boolean | undefined;
  public libretroSaves: boolean | undefined;
  public coreOptions: boolean | undefined;
  public coreOptionsVersion: string | undefined;
  public loadSubsystem: boolean | undefined;
  public hwRender: boolean | undefined;
  public needsFullPath: boolean | undefined;
  public diskControl: boolean | undefined;
  public isExperimental: boolean | undefined;
  public description: string | undefined;
  public notes: string | undefined;
  public needsKbdMouseFocus: boolean | undefined;
  public requiredHwApi: string | undefined;
  public databaseMatchArchiveMember: boolean | undefined;

  constructor(public readonly infoFile: InfoFile) {
    this.parseInfoFile();
  }

  private parseInfoFile() {
    let firmwareCount = 0;
    const firmwareDesc: string[] = [];
    const firmwarePath: string[] = [];
    const firmwareOpt: boolean[] = [];

    for (const element of this.infoFile.elements) {
      switch (element.name) {
        case "display_name":
          this.displayName = element.value as string;
          break;
        case "authors":
          this.authors = element.value as string;
          break;
        case "supported_extensions":
          this.supportedExtensions = element.value as string;
          break;
        case "corename":
          this.coreName = element.value as string;
          break;
        case "categories":
          this.categories = element.value as string;
          break;
        case "license":
          this.license = element.value as string;
          break;
        case "permissions":
          this.permissions = element.value as string;
          break;
        case "display_version":
          this.displayVersion = element.value as string;
          break;

        case "systemname":
          this.systemName = element.value as string;
          break;
        case "systemid":
          this.systemId = element.value as string;
          break;
        case "manufacturer":
          this.manufacturer = element.value as string;
          break;

        case "database":
          this.database = element.value as string;
          break;
        case "supports_no_game":
          this.supportsNoGame = element.value === "true";
          break;
        case "single_purpose":
          this.singlePurpose = element.value === "true";
          break;
        case "savestate":
          this.saveState = element.value === "true";
          break;
        case "savestate_features":
          this.saveStateFeatures = element.value as string;
          break;
        case "cheats":
          this.cheats = element.value === "true";
          break;
        case "input_descriptors":
          this.inputDescriptors = element.value === "true";
          break;
        case "memory_descriptors":
          this.memoryDescriptors = element.value === "true";
          break;
        case "libretro_saves":
          this.libretroSaves = element.value === "true";
          break;
        case "core_options":
          this.coreOptions = element.value === "true";
          break;
        case "core_options_version":
          this.coreOptionsVersion = element.value as string;
          break;
        case "load_subsystem":
          this.loadSubsystem = element.value === "true";
          break;
        case "hw_render":
          this.hwRender = element.value === "true";
          break;
        case "needs_fullpath":
          this.needsFullPath = element.value === "true";
          break;
        case "disk_control":
          this.diskControl = element.value === "true";
          break;
        case "is_experimental":
          this.isExperimental = element.value === "true";
          break;
        case "description":
          this.description = element.value as string;
          break;
        case "notes":
          this.notes = element.value as string;
          break;
        case "needs_kbd_mouse_focus":
          this.needsKbdMouseFocus = element.value === "true";
          break;
        case "required_hw_api":
          this.requiredHwApi = element.value as string;
          break;
        case "database_match_archive_member":
          this.databaseMatchArchiveMember = element.value === "true";
          break;
        case "firmware_count":
          firmwareCount = Number(element.value);
          break;
        default:
          if (element.name.startsWith("firmware")) {
            const index = parseInt(
              element.name
                .replace("firmware", "")
                .replace("_desc", "")
                .replace("_path", "")
                .replace("_opt", "")
            );
            if (Number.isNaN(index) || index < 0 || index >= firmwareCount) {
              throw new Error(
                `Invalid firmware index in ${this.infoFile.name}: ${element.name}`
              );
            }
            if (element.name.endsWith("_desc")) {
              firmwareDesc[index] = element.value as string;
            } else if (element.name.endsWith("_path")) {
              firmwarePath[index] = element.value as string;
            } else if (element.name.endsWith("_opt")) {
              firmwareOpt[index] = element.value === "true";
            }
          }
          break;
      }
    }

    if (
      firmwareCount > 0 &&
      firmwareDesc.length === firmwareCount &&
      firmwarePath.length === firmwareCount
    ) {
      const firmwareList: LibRetroFirmware[] = [];
      for (let i = 0; i < firmwareCount; i++) {
        if (firmwareDesc[i] !== undefined && firmwarePath[i] !== undefined) {
          firmwareList.push(
            new LibRetroFirmware(
              // biome-ignore lint/style/noNonNullAssertion: Same index
              firmwarePath[i]!,
              firmwareOpt[i] ?? false,
              // biome-ignore lint/style/noNonNullAssertion: Same index
              firmwareDesc[i]!
            )
          );
        } else {
          throw new Error(
            `Incomplete firmware entry at index ${i} in ${this.infoFile.name}`
          );
        }
      }
      this.firmware = firmwareList;
    } else if (firmwareCount > 0) {
      throw new Error(
        `Incomplete firmware information in ${this.infoFile.name}: expected ${firmwareCount} entries, found ${firmwareDesc.length} descs - ${firmwarePath.length} paths, ${firmwareOpt.length} options.`
      );
    }
  }

  static async loadAll(path: string): Promise<LibRetroInfo[]> {
    const files = await readdir(path);

    const parsed: LibRetroInfo[] = [];

    for (const file of files) {
      if (!file.endsWith(".info") || file === "open-source-notices.info")
        continue;
      const filePath = join(path, file);
      const content = await readFile(filePath, "utf-8");
      parsed.push(
        new LibRetroInfo(parseInfoFile(content, file.replace(/\.info$/, "")))
      );
    }

    return parsed;
  }
}

export class LibRetroFirmware {
  constructor(
    public path: string,
    public opt: boolean,
    public desc: string
  ) {}
}
