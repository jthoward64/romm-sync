import { getAllRoms } from "../lib/database/RetroArchTree";
import { html } from "./html";

export async function homePage(): Promise<string> {
  const roms = await getAllRoms();

  // Tailwind is available
  const body = `
<ul class="list-disc pl-6">
  ${roms
    .map(
      (system) => `
    <li class="mb-4">
      <strong class="text-lg">${system.systemId}</strong>
      <ul class="list-disc pl-6">
        ${system.cores
          .map(
            (core) => `
          <li class="mb-2">
            <span class="font-semibold">${core.fileName}</span>
            <ul class="list-disc pl-6">
              ${core.roms
                .map((rom) => `<li>${rom.retroarchPath}</li>`)
                .join("")}
            </ul>
          </li>
        `
          )
          .join("")}
      </ul>
    </li>
  `
    )
    .join("")}
</ul>
`;

  return html({
    body,
    title: "RetroArch Roms",
  });
}
