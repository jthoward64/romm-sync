import { WebUI } from "@webui-dev/bun-webui";
import { LibRetroInfo } from "../lib/retroarch/libretro-info/LibretroInfo";
import { RetroArchPaths } from "../lib/retroarch/paths";

const paths = await RetroArchPaths.getPaths();

const libretroInfos = await LibRetroInfo.loadAll(paths.info);

console.log(`Loaded ${libretroInfos.length} LibRetroInfo objects.`);

const myWindow = new WebUI();
myWindow.show(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Libretro Info Viewer</title>
      <script src="webui.js"></script>
    </head>
    <body>
      <h1>Libretro Info Files</h1>
      ${libretroInfos
        .sort((a, b) =>
          (a.systemName ?? a.infoFile.name).localeCompare(
            b.systemName ?? b.infoFile.name
          )
        )
        .map(
          (info) => `
        <details>
          <summary>
            <h2 id="${info.infoFile.name}" >${
            info.systemName ?? "Unknown System"
          } - ${info.infoFile.name}</h2>
          </summary>
          <h3>Software Information</h3>
          <ul>
            <li><strong>Display Name:</strong> ${info.displayName || "N/A"}</li>
            <li><strong>Authors:</strong> ${info.authors || "N/A"}</li>
            <li><strong>Supported Extensions:</strong> ${
              info.supportedExtensions || "N/A"
            }</li>
            <li><strong>Core Name:</strong> ${info.coreName || "N/A"}</li>
            <li><strong>Categories:</strong> ${info.categories || "N/A"}</li>
            <li><strong>License:</strong> ${info.license || "N/A"}</li>
            <li><strong>Permissions:</strong> ${info.permissions || "N/A"}</li>
            <li><strong>Display Version:</strong> ${
              info.displayVersion || "N/A"
            }</li>
          </ul>
          <h3>Hardware Information</h3>
          <ul>
            <li><strong>System Name:</strong> ${info.systemName || "N/A"}</li>
            <li><strong>System ID:</strong> ${info.systemId || "N/A"}</li>
            <li><strong>Manufacturer:</strong> ${
              info.manufacturer || "N/A"
            }</li>
          </ul>
          <h3>Libretro Features</h3>
          <ul>
            <li><strong>Database:</strong> ${info.database || "N/A"}</li>
            <li><strong>Supports No Game:</strong> ${
              info.supportsNoGame ? "Yes" : "No"
            }</li>
            <li><strong>Single Purpose:</strong> ${
              info.singlePurpose ? "Yes" : "No"
            }</li>
            <li><strong>Save State:</strong> ${
              info.saveState ? "Yes" : "No"
            }</li>
            <li><strong>Save State Features:</strong> ${
              info.saveStateFeatures || "N/A"
            }</li>
            <li><strong>Cheats:</strong> ${info.cheats ? "Yes" : "No"}</li>
            <li><strong>Input Descriptors:</strong> ${
              info.inputDescriptors ? "Yes" : "No"
            }</li>
            <li><strong>Memory Descriptors:</strong> ${
              info.memoryDescriptors ? "Yes" : "No"
            }</li>
            <li><strong>Libretro Saves:</strong> ${
              info.libretroSaves ? "Yes" : "No"
            }</li>
            <li><strong>Core Options:</strong> ${
              info.coreOptions ? "Yes" : "No"
            }</li>
            <li><strong>Core Options Version:</strong> ${
              info.coreOptionsVersion || "N/A"
            }</li>
            <li><strong>Load Subsystem:</strong> ${
              info.loadSubsystem ? "Yes" : "No"
            }</li>
            <li><strong>HW Render:</strong> ${info.hwRender ? "Yes" : "No"}</li>
            <li><strong>Needs Full Path:</strong> ${
              info.needsFullPath ? "Yes" : "No"
            }</li>
            <li><strong>Disk Control:</strong> ${
              info.diskControl ? "Yes" : "No"
            }</li>
            <li><strong>Is Experimental:</strong> ${
              info.isExperimental ? "Yes" : "No"
            }</li>
            <li><strong>Description:</strong> ${info.description || "N/A"}</li>
            <li><strong>Notes:</strong> ${info.notes || "N/A"}</li>
            <li><strong>Needs Keyboard/Mouse Focus:</strong> ${
              info.needsKbdMouseFocus ? "Yes" : "No"
            }</li>
            <li><strong>Required HW API:</strong> ${
              info.requiredHwApi || "N/A"
            }</li>
            <li><strong>Database Match Archive Member:</strong> ${
              info.databaseMatchArchiveMember ? "Yes" : "No"
            }</li>
          </ul>
          <h3>Firmware</h3>
          <ul>
            ${
              info.firmware
                ?.map(
                  (fw) => `
              <li>
                <strong>${fw.desc}</strong> - ${fw.path} ${
                    fw.opt ? "(Optional)" : ""
                  }
              </li>
            `
                )
                .join("") || "No firmware required."
            }
          </ul>
        </details>
    `
        )
        .join("<hr>")}
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1, h2, h3 {
          color: #333;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin: 5px 0;
        }
        strong {
          color: #555;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        details {
          margin-bottom: 20px;
        }
        summary {
          cursor: pointer;
          font-weight: bold;
        }
        details[open] summary {
          color: #007bff;
        }
        summary > h2 {
          display: inline-block;
        }
      </style>
  </html>`);
await WebUI.wait();
